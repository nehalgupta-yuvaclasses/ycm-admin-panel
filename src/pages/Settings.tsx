import { useEffect, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ProfileSettings } from "@/components/admin/settings/ProfileSettings";
import { PlatformSettings } from "@/components/admin/settings/PlatformSettings";
import { PaymentSettings } from "@/components/admin/settings/PaymentSettings";
import { SecuritySettings } from "@/components/admin/settings/SecuritySettings";
import type {
  PaymentFormValues,
  PasswordFormValues,
  PlatformFormValues,
  ProfileFormValues,
} from "@/components/admin/settings/types";

type ProfileState = {
  id: string;
  name: string;
  fullName: string;
  email: string;
  role: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  lastLoginAt: string;
};

type PlatformState = {
  platformName: string;
  logoUrl: string;
  contactEmail: string;
  supportPhone: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
};

type PaymentState = {
  provider: "razorpay";
  apiKey: string;
  apiSecret?: string;
  currency: "INR";
  gstRate: number;
  enablePayments: boolean;
};

type SessionItem = {
  id: string;
  title: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

type ActivityLog = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

const DEFAULT_PROFILE: ProfileState = {
  id: "",
  name: "Admin User",
  fullName: "Admin User",
  email: "admin@yuvaclasses.com",
  role: "admin",
  bio: "",
  avatarUrl: "",
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

const DEFAULT_PLATFORM: PlatformState = {
  platformName: "Yuva Classes",
  logoUrl: "",
  contactEmail: "support@yuvaclasses.com",
  supportPhone: "+91 98765 43210",
  defaultLanguage: "en",
  maintenanceMode: false,
};

const DEFAULT_PAYMENT: PaymentState = {
  provider: "razorpay",
  apiKey: "",
  apiSecret: "",
  currency: "INR",
  gstRate: 18,
  enablePayments: true,
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDeviceLabel() {
  if (typeof navigator === "undefined") {
    return "Desktop";
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("iphone") || userAgent.includes("android")) {
    return "Mobile";
  }
  if (userAgent.includes("mac")) {
    return "Mac";
  }
  if (userAgent.includes("windows")) {
    return "Windows";
  }
  if (userAgent.includes("linux")) {
    return "Linux";
  }

  return "Desktop";
}

function getBrowserLabel() {
  if (typeof navigator === "undefined") {
    return "Browser";
  }

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("edg")) {
    return "Edge";
  }
  if (userAgent.includes("chrome")) {
    return "Chrome";
  }
  if (userAgent.includes("firefox")) {
    return "Firefox";
  }
  if (userAgent.includes("safari")) {
    return "Safari";
  }

  return "Browser";
}

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [platform, setPlatform] = useState<PlatformState>(DEFAULT_PLATFORM);
  const [payment, setPayment] = useState<PaymentState>(DEFAULT_PAYMENT);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAvatarUploading, setProfileAvatarUploading] = useState(false);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformLogoUploading, setPlatformLogoUploading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings(showToast = false) {
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }

      const authUser = authData.user;

      if (authUser) {
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        const name =
          profileData?.name ||
          profileData?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email ||
          DEFAULT_PROFILE.name;

        setProfile({
          id: authUser.id,
          name,
          fullName: profileData?.full_name || name,
          email: authUser.email || profileData?.email || DEFAULT_PROFILE.email,
          role:
            profileData?.role ||
            authUser.user_metadata?.role ||
            DEFAULT_PROFILE.role,
          bio: profileData?.bio || "",
          avatarUrl: profileData?.avatar_url || "",
          createdAt: authUser.created_at || DEFAULT_PROFILE.createdAt,
          lastLoginAt: authUser.last_sign_in_at || authUser.created_at || DEFAULT_PROFILE.lastLoginAt,
        });

        setSessions([
          {
            id: "current-session",
            title: "Current session",
            device: `${getBrowserLabel()} on ${getDeviceLabel()}`,
            location: "This device",
            lastActive: authUser.last_sign_in_at || authUser.created_at || new Date().toISOString(),
            current: true,
          },
        ]);
      }

      const { data: platformData } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (platformData) {
        setPlatform({
          platformName: platformData.platform_name || DEFAULT_PLATFORM.platformName,
          logoUrl: platformData.logo_url || "",
          contactEmail: platformData.contact_email || DEFAULT_PLATFORM.contactEmail,
          supportPhone: platformData.support_phone || DEFAULT_PLATFORM.supportPhone,
          defaultLanguage: platformData.default_language || DEFAULT_PLATFORM.defaultLanguage,
          maintenanceMode: Boolean(platformData.maintenance_mode),
        });
      }

      const { data: paymentData } = await supabase
        .from("payment_settings")
        .select("provider, api_key, currency, gst_rate, enable_payments, is_enabled")
        .eq("id", 1)
        .maybeSingle();

      if (paymentData) {
        setPayment({
          provider: paymentData.provider === "razorpay" ? "razorpay" : DEFAULT_PAYMENT.provider,
          apiKey: paymentData.api_key || "",
          currency: DEFAULT_PAYMENT.currency,
          gstRate: paymentData.gst_rate ?? DEFAULT_PAYMENT.gstRate,
          enablePayments: Boolean(paymentData.is_enabled ?? paymentData.enable_payments),
          apiSecret: "",
        });
      }

      setActivityLogs((current) => {
        const loadLog = {
          id: `load-${Date.now()}`,
          title: "Settings loaded",
          detail: "Fetched profile and configuration data from Supabase.",
          timestamp: new Date().toISOString(),
        };
        return showToast ? [loadLog, ...current].slice(0, 5) : current;
      });

      if (showToast) {
        toast.success("Settings refreshed");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  }

  async function handleProfileSave(values: ProfileFormValues) {
    setProfileSaving(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }

      const authUser = authData.user;
      if (!authUser) {
        throw new Error("Not authenticated");
      }

      const fullName = values.name.trim();

      const [{ error: authUpdateError }, { error: profileUpdateError }] = await Promise.all([
        supabase.auth.updateUser({
          data: {
            full_name: fullName,
            name: fullName,
          },
        }),
        supabase.from("users").upsert({
          id: authUser.id,
          email: authUser.email,
          name: fullName,
          full_name: fullName,
          role: profile.role,
          bio: values.bio || "",
          avatar_url: profile.avatarUrl || null,
          updated_at: new Date().toISOString(),
        }),
      ]);

      if (authUpdateError) {
        throw authUpdateError;
      }

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      setProfile((current) => ({
        ...current,
        name: fullName,
        fullName,
        bio: values.bio || "",
      }));

      setActivityLogs((current) => [
        {
          id: `profile-${Date.now()}`,
          title: "Profile updated",
          detail: "Admin profile details were saved.",
          timestamp: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5));

      toast.success("Profile updated");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      throw error;
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    setProfileAvatarUploading(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `avatars/${profile.id || "admin"}-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("avatars").upload(filePath, file, {
        upsert: true,
      });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfile((current) => ({ ...current, avatarUrl: publicUrl }));

      const { error: profileError } = await supabase
        .from("users")
        .upsert({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          full_name: profile.fullName || profile.name,
          role: profile.role,
          bio: profile.bio,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw profileError;
      }

      toast.success("Avatar uploaded");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
      throw error;
    } finally {
      setProfileAvatarUploading(false);
    }
  }

  async function handlePlatformSave(values: PlatformFormValues) {
    setPlatformSaving(true);

    try {
      const { error } = await supabase.from("platform_settings").upsert({
        id: 1,
        platform_name: values.platformName,
        logo_url: platform.logoUrl || null,
        contact_email: values.contactEmail,
        support_phone: values.supportPhone,
        default_language: values.defaultLanguage,
        maintenance_mode: values.maintenanceMode,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setPlatform((current) => ({
        ...current,
        platformName: values.platformName,
        contactEmail: values.contactEmail,
        supportPhone: values.supportPhone,
        defaultLanguage: values.defaultLanguage,
        maintenanceMode: values.maintenanceMode,
      }));

      setActivityLogs((current) => [
        {
          id: `platform-${Date.now()}`,
          title: "Platform settings saved",
          detail: "Platform identity and maintenance status were updated.",
          timestamp: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5));

      toast.success("Platform settings saved");
    } catch (error) {
      console.error("Error saving platform settings:", error);
      toast.error("Failed to save platform settings");
      throw error;
    } finally {
      setPlatformSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setPlatformLogoUploading(true);

    try {
      const fileExt = file.name.split(".").pop() || "png";
      const filePath = `brand-assets/logo-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("brand-assets").upload(filePath, file, {
        upsert: true,
      });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("brand-assets").getPublicUrl(filePath);

      setPlatform((current) => ({ ...current, logoUrl: publicUrl }));

      const { error: platformError } = await supabase
        .from("platform_settings")
        .upsert({
          id: 1,
          platform_name: platform.platformName,
          logo_url: publicUrl,
          contact_email: platform.contactEmail,
          support_phone: platform.supportPhone,
          default_language: platform.defaultLanguage,
          maintenance_mode: platform.maintenanceMode,
          updated_at: new Date().toISOString(),
        });

      if (platformError) {
        throw platformError;
      }

      toast.success("Logo uploaded");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
      throw error;
    } finally {
      setPlatformLogoUploading(false);
    }
  }

  async function handlePaymentSave(values: PaymentFormValues) {
    setPaymentSaving(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Your session expired. Please sign in again.");
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }

      let accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw refreshError;
        }

        accessToken = refreshData.session?.access_token;
      }

      if (!accessToken) {
        throw new Error("Your session expired. Please sign in again.");
      }

      const { data, error } = await supabase.functions.invoke("razorpay-payments", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: {
          action: "save_payment_settings",
          apiKey: values.apiKey,
          apiSecret: values.apiSecret?.trim() || "",
          gstRate: values.gstRate,
          isEnabled: values.enablePayments,
        },
      });

      if (error) {
        console.error("Edge Function error:", error);
        // Check if the error contains debug info from the function
        const errWithContext = error as any;
        if (errWithContext?.context?.data?.debug) {
          console.error("Auth debug info:", errWithContext.context.data.debug);
          throw new Error(`Auth failed: ${JSON.stringify(errWithContext.context.data.debug)}`);
        }
        throw error;
      }

      if (data?.error) {
        console.error("Edge Function data error:", data);
        throw new Error(data.error);
      }

      setPayment({
        provider: values.provider,
        apiKey: values.apiKey,
        apiSecret: "",
        currency: values.currency,
        gstRate: values.gstRate,
        enablePayments: values.enablePayments,
      });

      setActivityLogs((current) => [
        {
          id: `payment-${Date.now()}`,
          title: "Payment settings saved",
          detail: "Payment settings updated.",
          timestamp: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5));

      toast.success("Payment settings saved");
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast.error("Failed to save payment settings");
      throw error;
    } finally {
      setPaymentSaving(false);
    }
  }

  async function handlePasswordSave(values: PasswordFormValues) {
    setPasswordSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) {
        throw error;
      }

      setActivityLogs((current) => [
        {
          id: `password-${Date.now()}`,
          title: "Password changed",
          detail: "Admin password was updated successfully.",
          timestamp: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5));

      toast.success("Password updated");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
      throw error;
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleLogoutAllDevices() {
    setSigningOutAll(true);

    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        throw error;
      }

      setActivityLogs((current) => [
        {
          id: `logout-${Date.now()}`,
          title: "Logged out all devices",
          detail: "All active sessions were revoked.",
          timestamp: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 5));

      toast.success("All devices logged out");
    } catch (error) {
      console.error("Error signing out globally:", error);
      toast.error("Failed to log out all devices");
      throw error;
    } finally {
      setSigningOutAll(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Admin control center for profile, platform, billing, and security."
      >
        <Button
          variant="outline"
          className="h-10 gap-2 rounded-lg"
          onClick={() => {
            setIsReloading(true);
            loadSettings(true);
          }}
          disabled={isReloading}
        >
          {isReloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </Button>
      </PageHeader>

      <PageToolbar
        actions={<div className="flex items-center gap-2 text-sm text-muted-foreground">Control surface ready</div>}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max gap-1 rounded-lg border border-border/60 bg-card p-1">
            <TabsTrigger value="profile" className="rounded-md px-4 py-2">
              Profile
            </TabsTrigger>
            <TabsTrigger value="platform" className="rounded-md px-4 py-2">
              Platform
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-md px-4 py-2">
              Payments
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md px-4 py-2">
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="outline-none">
          <ProfileSettings
            profile={profile}
            onSave={handleProfileSave}
            onAvatarUpload={handleAvatarUpload}
            isSaving={profileSaving}
            isUploadingAvatar={profileAvatarUploading}
          />
        </TabsContent>

        <TabsContent value="platform" className="outline-none">
          <PlatformSettings
            settings={platform}
            onSave={handlePlatformSave}
            onLogoUpload={handleLogoUpload}
            isSaving={platformSaving}
            isUploadingLogo={platformLogoUploading}
          />
        </TabsContent>

        <TabsContent value="payments" className="outline-none">
          <PaymentSettings settings={payment} onSave={handlePaymentSave} isSaving={paymentSaving} />
        </TabsContent>

        <TabsContent value="security" className="outline-none">
          <SecuritySettings
            profile={profile}
            sessions={sessions}
            activityLogs={activityLogs}
            onChangePassword={handlePasswordSave}
            onLogoutAllDevices={handleLogoutAllDevices}
            isChangingPassword={passwordSaving}
            isLoggingOutAll={signingOutAll}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}