import { supabase } from "@/lib/supabase/client";

export async function getUserFinancialSpaceId(userId: string) {
  const { data, error } = await supabase
    .from("financial_spaces")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}
