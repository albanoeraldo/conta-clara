import { supabase } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile | null;
}

type SaveProfileInput = {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
};

export async function saveProfile({
  userId,
  fullName,
  email,
  phone,
}: SaveProfileInput) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    email,
    phone: phone?.trim() || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
