import { supabase } from "@/lib/supabase";
import type { Resource } from "./types";

const TABLE = "resources";
const BUCKET = "resources";

// ── CRUD ─────────────────────────────────────────────────────────────

export async function fetchResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Resource[];
}

export async function createResource(
  resource: Omit<Resource, "id" | "created_at">
): Promise<Resource> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(resource)
    .select()
    .single();

  if (error) throw error;
  return data as Resource;
}

export async function updateResource(
  id: string,
  updates: Partial<Resource>
): Promise<Resource> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Resource;
}

export async function deleteResource(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

// ── Storage ──────────────────────────────────────────────────────────

export async function uploadResourceFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Simulate progress (Supabase JS doesn't expose upload progress natively)
  let fakeProgress = 0;
  const interval = onProgress
    ? setInterval(() => {
        fakeProgress = Math.min(fakeProgress + 15, 90);
        onProgress(fakeProgress);
      }, 200)
    : null;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (interval) clearInterval(interval);
  onProgress?.(100);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}
