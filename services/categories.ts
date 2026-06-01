import { supabase } from "@/lib/supabase/client";

type DefaultCategory = {
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
};

const defaultCategories: DefaultCategory[] = [
  {
    name: "Salário",
    type: "income",
    color: "#22c55e",
    icon: "wallet",
  },
  {
    name: "Extra",
    type: "income",
    color: "#10b981",
    icon: "plus-circle",
  },
  {
    name: "Outros",
    type: "income",
    color: "#84cc16",
    icon: "circle-dollar-sign",
  },
  {
    name: "Moradia",
    type: "expense",
    color: "#f97316",
    icon: "home",
  },
  {
    name: "Mercado",
    type: "expense",
    color: "#ef4444",
    icon: "shopping-cart",
  },
  {
    name: "Transporte",
    type: "expense",
    color: "#eab308",
    icon: "car",
  },
  {
    name: "Saúde",
    type: "expense",
    color: "#ec4899",
    icon: "heart-pulse",
  },
  {
    name: "Internet",
    type: "expense",
    color: "#3b82f6",
    icon: "wifi",
  },
  {
    name: "Cartão",
    type: "expense",
    color: "#a855f7",
    icon: "credit-card",
  },
  {
    name: "Assinaturas",
    type: "expense",
    color: "#6366f1",
    icon: "repeat",
  },
  {
    name: "Outros",
    type: "expense",
    color: "#71717a",
    icon: "more-horizontal",
  },
];

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  is_default: boolean;
  active: boolean;
};

export async function createDefaultCategories(financialSpaceId: string) {
  const { data: existingCategories, error: existingCategoriesError } =
    await supabase
      .from("categories")
      .select("id")
      .eq("financial_space_id", financialSpaceId)
      .eq("is_default", true)
      .limit(1);

  if (existingCategoriesError) {
    throw new Error(existingCategoriesError.message);
  }

  if ((existingCategories?.length ?? 0) > 0) {
    return;
  }

  const categoriesToInsert = defaultCategories.map((category) => ({
    financial_space_id: financialSpaceId,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
    is_default: true,
    active: true,
  }));

  const { error } = await supabase
    .from("categories")
    .insert(categoriesToInsert);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getActiveCategories(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color, icon, is_default, active")
    .eq("financial_space_id", financialSpaceId)
    .eq("active", true)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Category[];
}

export async function getCategories(financialSpaceId: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, color, icon, is_default, active")
    .eq("financial_space_id", financialSpaceId)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Category[];
}

type CreateCategoryInput = {
  financialSpaceId: string;
  name: string;
  type: "income" | "expense";
};

export async function createCategory({
  financialSpaceId,
  name,
  type,
}: CreateCategoryInput) {
  const { error } = await supabase.from("categories").insert({
    financial_space_id: financialSpaceId,
    name,
    type,
    color: type === "income" ? "#22c55e" : "#ef4444",
    icon: "tag",
    is_default: false,
    active: true,
  });

  if (error) {
    throw new Error(error.message);
  }
}
