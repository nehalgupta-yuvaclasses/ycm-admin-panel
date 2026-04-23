import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";

type PaymentSettingsRow = {
  id: number;
  provider: string;
  api_key: string;
  currency: string;
  gst_rate: number | string;
  enable_payments?: boolean | null;
  is_enabled?: boolean | null;
};

type CourseRow = {
  id: string;
  title: string;
  selling_price: number | string | null;
  buying_price: number | string | null;
};

type PaymentRow = {
  id: string;
  user_id: string;
  course_id: string;
  order_id: string | null;
  payment_id: string | null;
  amount: number | string;
  status: string;
  provider?: string | null;
  currency?: string | null;
  gst_amount?: number | string | null;
};

type PaymentSyncRow = {
  payment_uuid: string;
  enrollment_uuid: string | null;
  payment_status: string;
  enrollment_status: string | null;
};

type RequestActor = {
  id: string;
  role: string;
  provider: "supabase" | "firebase";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEnabled(settings: PaymentSettingsRow | null) {
  return Boolean(settings?.is_enabled ?? settings?.enable_payments ?? true);
}

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const asciiString = atob(padded);
    const utf8String = decodeURIComponent(
      asciiString
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(utf8String);
  } catch (err) {
    console.error("JWT Decode error:", err);
    return null;
  }
}

function getSupabaseClients() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { serviceClient, authClient };
}

async function getRequestActor(
  request: Request,
  serviceClient: ReturnType<typeof getSupabaseClients>["serviceClient"],
  authClient: ReturnType<typeof getSupabaseClients>["authClient"],
  debugLog?: any,
): Promise<RequestActor | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    if (debugLog) debugLog.error = "no_auth_header";
    return null;
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    if (debugLog) debugLog.error = "empty_token";
    return null;
  }

  // Use Supabase's proper auth verification to get the user
  console.log(
    "Attempting auth verification with token prefix:",
    token.substring(0, 20) + "...",
  );

  // Try authClient first, then fallback to serviceClient
  let supabaseUser = null;
  let authError = null;

  // Try with authClient (anon key)
  let result = await authClient.auth.getUser(token);
  if (result.data?.user) {
    supabaseUser = result.data.user;
  } else if (result.error) {
    authError = result.error;
    // Try with serviceClient as fallback
    console.log(
      "Auth client failed, trying serviceClient:",
      result.error.message,
    );
    result = await serviceClient.auth.getUser(token);
    if (result.data?.user) {
      supabaseUser = result.data.user;
      authError = null;
    } else if (result.error) {
      authError = result.error;
    }
  }

  console.log(
    "Auth result - user:",
    supabaseUser?.id,
    "error:",
    authError?.message,
  );

  if (authError) {
    if (debugLog) debugLog.authError = authError.message;
    console.log("Auth error:", authError.message);
  }

  if (supabaseUser) {
    const userId = supabaseUser.id;
    console.log("Verified user ID:", userId);

    try {
      // First, try to get the role from the users table
      const { data: userRow, error: userError } = await serviceClient
        .from("users")
        .select("id, role")
        .eq("id", userId)
        .maybeSingle();

      if (!userError && userRow) {
        return {
          id: String(userRow.id),
          role: String(
            userRow.role ?? supabaseUser.user_metadata?.role ?? "student",
          ),
          provider: "supabase",
        };
      }

      // Fallback: Check JWT metadata for role if user not in users table
      const roleFromJwt = supabaseUser.user_metadata?.role;
      if (roleFromJwt) {
        return {
          id: userId,
          role: String(roleFromJwt),
          provider: "supabase",
        };
      }

      if (debugLog) debugLog.noRoleFound = true;
      return null;
    } catch (err) {
      if (debugLog) debugLog.dbException = String(err);
    }
  } else {
    // Supabase auth failed - try manual JWT decode
    console.log("Supabase auth failed, trying manual JWT decode");

    const decoded = decodeJwtPayload(token);
    const subject = String(decoded?.sub ?? "").trim();

    console.log(
      "Decoded JWT - subject:",
      subject,
      "role:",
      decoded?.user_metadata?.role,
    );

    if (subject) {
      // First try Supabase users table
      try {
        const { data: userRow, error: userError } = await serviceClient
          .from("users")
          .select("id, role")
          .eq("id", subject)
          .maybeSingle();

        if (!userError && userRow) {
          return {
            id: String(userRow.id),
            role: String(
              userRow.role ?? decoded?.user_metadata?.role ?? "student",
            ),
            provider: "supabase",
          };
        }
      } catch (e) {
        console.log("Users table lookup failed:", e);
      }

      // Check JWT metadata for role
      const roleFromJwt = decoded?.user_metadata?.role;
      if (roleFromJwt) {
        return {
          id: subject,
          role: String(roleFromJwt),
          provider: "supabase",
        };
      }

      // Try Firebase
      const firebaseProjectId =
        Deno.env.get("FIREBASE_PROJECT_ID") ??
        Deno.env.get("VITE_FIREBASE_PROJECT_ID") ??
        "";
      if (firebaseProjectId) {
        try {
          const jwks = createRemoteJWKSet(
            new URL(
              "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
            ),
          );
          const verified = await jwtVerify(token, jwks, {
            issuer: `https://securetoken.google.com/${firebaseProjectId}`,
            audience: firebaseProjectId,
          });

          const firebaseUid = String(verified.payload.sub ?? "").trim();
          if (!firebaseUid) {
            if (debugLog) debugLog.firebaseNoSub = true;
            return null;
          }

          const { data: userRow, error: userError } = await serviceClient
            .from("users")
            .select("id, role, firebase_uid")
            .eq("firebase_uid", firebaseUid)
            .maybeSingle();

          if (userError || !userRow) {
            if (debugLog) debugLog.firebaseNoUser = true;
            return null;
          }

          return {
            id: String(userRow.id),
            role: String(userRow.role ?? "student"),
            provider: "firebase",
          };
        } catch {
          if (debugLog) debugLog.firebaseVerifyFailed = true;
        }
      }
    }

    if (debugLog) debugLog.noSupabaseUser = true;
  }

  return null;
}

async function loadPaymentSettings(
  serviceClient: ReturnType<typeof getSupabaseClients>["serviceClient"],
): Promise<PaymentSettingsRow | null> {
  const { data, error } = await serviceClient
    .from("payment_settings")
    .select(
      "id, provider, api_key, currency, gst_rate, enable_payments, is_enabled",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PaymentSettingsRow | null;
}

function getSecret(settings: PaymentSettingsRow | null) {
  return Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
}

async function syncRazorpayPayment(
  serviceClient: ReturnType<typeof getSupabaseClients>["serviceClient"],
  payload: {
    userId: string;
    courseId: string;
    orderId: string;
    paymentId?: string | null;
    signature?: string | null;
    amount: number;
    currency: string;
    provider: string;
    gstAmount: number;
    status: string;
    source: string;
    verifiedAt?: string | null;
  },
) {
  const { data, error } = await serviceClient.rpc("sync_razorpay_payment", {
    p_user_id: payload.userId,
    p_course_id: payload.courseId,
    p_order_id: payload.orderId,
    p_payment_id: payload.paymentId ?? null,
    p_signature: payload.signature ?? null,
    p_amount: payload.amount,
    p_currency: payload.currency,
    p_provider: payload.provider,
    p_gst_amount: payload.gstAmount,
    p_status: payload.status,
    p_source: payload.source,
    p_verified_at: payload.verifiedAt ?? null,
  });

  if (error) {
    throw error;
  }

  const rows = (data as PaymentSyncRow[] | null) ?? [];
  return rows[0] ?? null;
}

async function hmacSha256Hex(secret: string, payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getExpectedAmount(course: CourseRow, gstRate: number) {
  const baseAmount = toNumber(course.selling_price ?? course.buying_price ?? 0);
  const gstAmount = Math.round((baseAmount * gstRate) / 100);
  const totalAmount = baseAmount + gstAmount;
  return { baseAmount, gstAmount, totalAmount };
}

async function createRazorpayOrder(
  request: Request,
  payload: Record<string, unknown>,
) {
  const { serviceClient, authClient } = getSupabaseClients();
  const actor = await getRequestActor(request, serviceClient, authClient);

  if (!actor) {
    return json(401, { error: "Authentication required" });
  }

  const courseId = String(payload.courseId ?? "").trim();
  const requestedAmount =
    payload.amount == null ? null : toNumber(payload.amount);

  if (!courseId) {
    return json(400, { error: "courseId is required" });
  }

  const settings = await loadPaymentSettings(serviceClient);
  if (!settings || !normalizeEnabled(settings)) {
    return json(400, { error: "Payments are disabled" });
  }

  const { data: course, error: courseError } = await serviceClient
    .from("courses")
    .select("id, title, selling_price, buying_price")
    .eq("id", courseId)
    .maybeSingle();

  if (courseError) {
    return json(500, { error: courseError.message });
  }

  if (!course) {
    return json(404, { error: "Course not found" });
  }

  const expected = getExpectedAmount(
    course as CourseRow,
    toNumber(settings.gst_rate),
  );
  if (
    requestedAmount != null &&
    Math.abs(requestedAmount - expected.totalAmount) > 0.01
  ) {
    return json(400, {
      error: "Amount mismatch",
      expectedAmount: expected.totalAmount,
    });
  }

  const keyId = settings.api_key || Deno.env.get("RAZORPAY_KEY_ID") || "";
  const secret = getSecret(settings);

  if (!keyId || !secret) {
    return json(500, { error: "Razorpay credentials are not configured" });
  }

  const amountInPaise = Math.round(expected.totalAmount * 100);
  const receipt = `course_${courseId}_${actor.id}_${Date.now()}`;

  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${keyId}:${secret}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: settings.currency || "INR",
      receipt,
      notes: {
        user_id: actor.id,
        course_id: courseId,
        course_title: (course as CourseRow).title,
      },
    }),
  });

  if (!razorpayResponse.ok) {
    const responseText = await razorpayResponse.text();
    return json(502, {
      error: "Unable to create Razorpay order",
      details: responseText,
    });
  }

  const order = await razorpayResponse.json();

  try {
    await syncRazorpayPayment(serviceClient, {
      userId: actor.id,
      courseId,
      orderId: order.id,
      amount: expected.totalAmount,
      currency: settings.currency || "INR",
      provider: settings.provider,
      gstAmount: expected.gstAmount,
      status: "pending",
      source: (payload.source as string | undefined) ?? "web",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to persist payment order";
    return json(500, { error: message });
  }

  return json(200, {
    orderId: order.id,
    amount: expected.totalAmount,
    currency: settings.currency || "INR",
    apiKey: keyId,
    gstRate: toNumber(settings.gst_rate),
    provider: settings.provider,
    courseTitle: (course as CourseRow).title,
  });
}

async function verifyPayment(
  request: Request,
  payload: Record<string, unknown>,
) {
  const { serviceClient, authClient } = getSupabaseClients();
  const actor = await getRequestActor(request, serviceClient, authClient);

  if (!actor) {
    return json(401, { error: "Authentication required" });
  }

  const razorpayPaymentId = String(
    payload.razorpay_payment_id ?? payload.paymentId ?? "",
  ).trim();
  const razorpayOrderId = String(
    payload.razorpay_order_id ?? payload.orderId ?? "",
  ).trim();
  const razorpaySignature = String(
    payload.razorpay_signature ?? payload.signature ?? "",
  ).trim();

  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return json(400, { error: "Missing payment verification fields" });
  }

  const settings = await loadPaymentSettings(serviceClient);
  const secret = getSecret(settings);
  if (!secret) {
    return json(500, { error: "Razorpay secret is not configured" });
  }

  const { data: paymentRow, error: paymentFetchError } = await serviceClient
    .from("payments")
    .select(
      "id, user_id, course_id, order_id, payment_id, amount, status, provider, currency, gst_amount",
    )
    .eq("order_id", razorpayOrderId)
    .maybeSingle();

  if (paymentFetchError) {
    return json(500, { error: paymentFetchError.message });
  }

  if (!paymentRow) {
    return json(404, { error: "Payment row not found" });
  }

  const row = paymentRow as PaymentRow;
  if (row.user_id !== actor.id && actor.role !== "admin") {
    return json(403, { error: "You cannot verify this payment" });
  }

  const expectedSignature = await hmacSha256Hex(
    secret,
    `${razorpayOrderId}|${razorpayPaymentId}`,
  );
  if (expectedSignature !== razorpaySignature) {
    try {
      await syncRazorpayPayment(serviceClient, {
        userId: row.user_id,
        courseId: row.course_id,
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        amount: toNumber(row.amount),
        currency: row.currency ?? settings?.currency ?? "INR",
        provider: row.provider ?? settings?.provider ?? "razorpay",
        gstAmount: toNumber(row.gst_amount ?? 0),
        status: "failed",
        source: (payload.source as string | undefined) ?? "web",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to mark payment as failed";
      return json(500, { error: message });
    }

    return json(400, { error: "Invalid Razorpay signature" });
  }

  let syncResult: PaymentSyncRow | null = null;
  try {
    syncResult = await syncRazorpayPayment(serviceClient, {
      userId: row.user_id,
      courseId: row.course_id,
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      amount: toNumber(row.amount),
      currency: row.currency ?? settings?.currency ?? "INR",
      provider: row.provider ?? settings?.provider ?? "razorpay",
      gstAmount: toNumber(row.gst_amount ?? 0),
      status: "success",
      source: (payload.source as string | undefined) ?? "web",
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to finalize payment";
    return json(500, { error: message });
  }

  return json(200, {
    success: true,
    paymentId: razorpayPaymentId,
    orderId: razorpayOrderId,
    courseId: row.course_id,
    enrollmentId: syncResult?.enrollment_uuid ?? null,
  });
}

async function savePaymentSettings(
  request: Request,
  payload: Record<string, unknown>,
) {
  const { serviceClient, authClient } = getSupabaseClients();
  const adminCheckLog: any = {
    supabaseProviderFailed: false,
    fallbackFailed: false,
  };
  const actor = await getRequestActor(
    request,
    serviceClient,
    authClient,
    adminCheckLog,
  );

  if (!actor) {
    return json(401, {
      error: "Authentication required",
      debug: adminCheckLog,
    });
  }

  if (actor.role !== "admin") {
    return json(403, { error: "Admin access required" });
  }

  const provider = String(payload.provider ?? "razorpay").trim() || "razorpay";
  const apiKey = String(payload.apiKey ?? payload.api_key ?? "").trim();
  const currency = String(payload.currency ?? "INR").trim() || "INR";
  const gstRate = toNumber(payload.gstRate ?? payload.gst_rate ?? 18);
  const isEnabled = Boolean(
    payload.isEnabled ??
    payload.enablePayments ??
    payload.enable_payments ??
    true,
  );

  const updateRow: Record<string, unknown> = {
    id: 1,
    provider,
    api_key: apiKey,
    api_secret: "",
    currency,
    gst_rate: gstRate,
    is_enabled: isEnabled,
    updated_at: new Date().toISOString(),
  };

  const { error } = await serviceClient
    .from("payment_settings")
    .upsert(updateRow);
  if (error) {
    return json(500, { error: error.message });
  }

  return json(200, {
    success: true,
    settings: {
      provider,
      apiKey,
      currency,
      gstRate,
      isEnabled,
    },
  });
}

async function getPublicPaymentSettings() {
  const { serviceClient } = getSupabaseClients();
  const settings = await loadPaymentSettings(serviceClient);

  return json(200, {
    provider: settings?.provider ?? "razorpay",
    apiKey: settings?.api_key ?? Deno.env.get("RAZORPAY_KEY_ID") ?? "",
    currency: settings?.currency ?? "INR",
    gstRate: toNumber(settings?.gst_rate ?? 18),
    isEnabled: normalizeEnabled(settings),
  });
}

function parseWebhookPayment(body: Record<string, unknown>) {
  const payload = body.payload as Record<string, unknown> | undefined;
  const paymentEntity = (
    payload?.payment as Record<string, unknown> | undefined
  )?.entity as Record<string, unknown> | undefined;
  const orderEntity = (payload?.order as Record<string, unknown> | undefined)
    ?.entity as Record<string, unknown> | undefined;
  const notes =
    (paymentEntity?.notes as Record<string, unknown> | undefined) ?? {};

  return {
    event: String(body.event ?? "").trim(),
    paymentId: String(paymentEntity?.id ?? "").trim(),
    orderId: String(paymentEntity?.order_id ?? orderEntity?.id ?? "").trim(),
    userId: String(notes.user_id ?? "").trim(),
    courseId: String(notes.course_id ?? "").trim(),
    amount: toNumber(paymentEntity?.amount ?? 0) / 100,
    currency: String(paymentEntity?.currency ?? "INR").trim() || "INR",
  };
}

async function handleRazorpayWebhook(request: Request) {
  const rawBody = await request.text();
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!webhookSecret) {
    return json(500, { error: "Razorpay webhook secret is not configured" });
  }

  const expectedSignature = await hmacSha256Hex(webhookSecret, rawBody);
  if (expectedSignature !== signature) {
    return json(400, { error: "Invalid webhook signature" });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid webhook payload" });
  }

  const { serviceClient } = getSupabaseClients();
  const payment = parseWebhookPayment(body);

  if (!payment.orderId) {
    return json(400, { error: "Webhook is missing an order ID" });
  }

  let userId = payment.userId;
  let courseId = payment.courseId;
  let resolvedAmount = payment.amount;
  let resolvedCurrency = payment.currency;
  let resolvedProvider = "razorpay";
  let resolvedGstAmount = 0;

  if (!userId || !courseId) {
    const { data: paymentRow, error } = await serviceClient
      .from("payments")
      .select("user_id, course_id, amount, provider, currency, gst_amount")
      .eq("order_id", payment.orderId)
      .maybeSingle();

    if (error) {
      return json(500, { error: error.message });
    }

    userId = userId || String(paymentRow?.user_id ?? "");
    courseId = courseId || String(paymentRow?.course_id ?? "");
    resolvedAmount = payment.amount || toNumber(paymentRow?.amount ?? 0);
    resolvedCurrency =
      payment.currency || String(paymentRow?.currency ?? "INR");
    resolvedProvider = String(paymentRow?.provider ?? "razorpay") || "razorpay";
    resolvedGstAmount = toNumber(paymentRow?.gst_amount ?? 0);
  }

  if (!userId || !courseId) {
    return json(400, { error: "Webhook could not resolve payment context" });
  }

  const normalizedEvent = payment.event.toLowerCase();
  const status = normalizedEvent.includes("failed") ? "failed" : "success";

  const syncResult = await syncRazorpayPayment(serviceClient, {
    userId,
    courseId,
    orderId: payment.orderId,
    paymentId: payment.paymentId || null,
    signature,
    amount: resolvedAmount,
    currency: resolvedCurrency,
    provider: resolvedProvider,
    gstAmount: resolvedGstAmount,
    status,
    source: "webhook",
    verifiedAt: new Date().toISOString(),
  });

  return json(200, {
    success: true,
    event: payment.event,
    paymentId: syncResult?.payment_uuid ?? null,
    enrollmentId: syncResult?.enrollment_uuid ?? null,
  });
}

Deno.serve(async (request) => {
  console.log(
    "Edge function invoked, method:",
    request.method,
    "url:",
    request.url,
  );

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (request.headers.has("x-razorpay-signature")) {
    return await handleRazorpayWebhook(request);
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "").trim();
  console.log("Action:", action);

  try {
    switch (action) {
      case "create_razorpay_order":
        return await createRazorpayOrder(request, body);
      case "verify_payment":
        return await verifyPayment(request, body);
      case "save_payment_settings":
        console.log("Calling savePaymentSettings");
        return await savePaymentSettings(request, body);
      case "get_public_payment_settings":
        return await getPublicPaymentSettings();
      default:
        return json(400, { error: "Unknown payment action" });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected payment error";
    console.error("Edge function error:", error);
    return json(500, { error: message });
  }
});
