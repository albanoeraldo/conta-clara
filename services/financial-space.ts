import { supabase } from "@/lib/supabase/client";

export type FinancialSpace = {
  id: string;
  owner_id: string;
  name: string;
  type: "personal" | "couple" | "family" | "business";
  monthly_income: number | null;
  created_at: string;
  updated_at: string;
};

export async function getFinancialSpaceByOwnerId(userId: string) {
  const { data, error } = await supabase
    .from("financial_spaces")
    .select("id, owner_id, name, type, monthly_income, created_at, updated_at")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as FinancialSpace | null;
}

type UpdateFinancialSpaceInput = {
  financialSpaceId: string;
  ownerId: string;
  name: string;
  type: "personal" | "couple" | "family" | "business";
  monthlyIncome?: string;
};

export async function updateFinancialSpace({
  financialSpaceId,
  ownerId,
  name,
  type,
  monthlyIncome,
}: UpdateFinancialSpaceInput) {
  const { error } = await supabase
    .from("financial_spaces")
    .update({
      name,
      type,
      monthly_income: monthlyIncome ? Number(monthlyIncome) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", financialSpaceId)
    .eq("owner_id", ownerId);

  if (error) {
    throw new Error(error.message);
  }
}
