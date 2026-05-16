import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiError = {
  status: number;
  message: string;
};

/**
 * Browser-side fetch wrapper. Attaches the current Supabase access token
 * as a Bearer header. Use from client components only.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw { status: res.status, message } satisfies ApiError;
  }

  return (await res.json()) as T;
}
