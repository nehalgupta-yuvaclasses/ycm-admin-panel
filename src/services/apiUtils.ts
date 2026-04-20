import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export const isSupabaseError = (error: any): error is ApiError => {
  return error && typeof error === "object" && "code" in error;
};

export const formatApiError = (error: any): string => {
  if (!error) return "Unknown error occurred";

  if (isSupabaseError(error)) {
    switch (error.code) {
      case "PGRST116":
        return "Table not found. Please contact support.";
      case "42P17":
        return "Database configuration error. Please contact support.";
      case "PGRST301":
        return "Invalid data format. Please check your input.";
      case "23505":
        return "Duplicate entry. This record already exists.";
      case "23503":
        return "Referenced record not found.";
      default:
        return error.message || "Database error occurred";
    }
  }

  return error.message || "An unexpected error occurred";
};

export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T[] | null = null,
  showErrorToast = false,
): Promise<{ data: T[] | null; error: any }> => {
  try {
    const { data, error } = await queryFn();

    if (error) {
      if (showErrorToast) {
        toast.error(formatApiError(error));
      }
      console.error("API Error:", error);
      return { data: fallbackData as T[], error };
    }

    return { data: data as T[], error: null };
  } catch (err: any) {
    console.error("Query exception:", err);
    if (showErrorToast) {
      toast.error(formatApiError(err));
    }
    return { data: fallbackData as T[], error: err };
  }
};

export const safeSingle = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: any = null,
  showErrorToast = false,
): Promise<{ data: T | null; error: any }> => {
  try {
    const { data, error } = await queryFn();

    if (error) {
      if (showErrorToast) {
        toast.error(formatApiError(error));
      }
      console.error("API Error:", error);
      return { data: fallbackData, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error("Query exception:", err);
    if (showErrorToast) {
      toast.error(formatApiError(err));
    }
    return { data: fallbackData, error: err };
  }
};

export const safeInsert = async (
  table: string,
  data: any,
  showErrorToast = false,
): Promise<{ data: any; error: any }> => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();

    if (error) {
      if (showErrorToast) {
        toast.error(formatApiError(error));
      }
      console.error("Insert Error:", error);
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (err: any) {
    console.error("Insert exception:", err);
    if (showErrorToast) {
      toast.error(formatApiError(err));
    }
    return { data: null, error: err };
  }
};

export const safeUpdate = async (
  table: string,
  id: string,
  updates: Record<string, any>,
  idColumn = "id",
  showErrorToast = false,
): Promise<{ data: any; error: any }> => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(updates)
      .eq(idColumn, id)
      .select()
      .single();

    if (error) {
      if (showErrorToast) {
        toast.error(formatApiError(error));
      }
      console.error("Update Error:", error);
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (err: any) {
    console.error("Update exception:", err);
    if (showErrorToast) {
      toast.error(formatApiError(err));
    }
    return { data: null, error: err };
  }
};

export const safeDelete = async (
  table: string,
  id: string,
  idColumn = "id",
  showErrorToast = false,
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.from(table).delete().eq(idColumn, id);

    if (error) {
      if (showErrorToast) {
        toast.error(formatApiError(error));
      }
      console.error("Delete Error:", error);
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Delete exception:", err);
    if (showErrorToast) {
      toast.error(formatApiError(err));
    }
    return { error: err };
  }
};

export const setupRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filterColumn?: string,
  filterValue?: string,
) => {
  let channel = supabase.channel(`realtime-${table}`);

  if (filterColumn && filterValue) {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter: `${filterColumn}=eq.${filterValue}`,
      },
      callback,
    );
  } else {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      callback,
    );
  }

  return channel.subscribe();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
