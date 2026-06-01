"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category";
import {
  createCategory,
  getCategories,
  type Category,
} from "@/services/categories";

export default function CategoriasPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: "expense",
    },
  });

  const incomeCategories = categories.filter(
    (category) => category.type === "income",
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const loadCategories = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return;
      }

      const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

      if (!currentFinancialSpaceId) {
        return;
      }

      const userCategories = await getCategories(currentFinancialSpaceId);

      setFinancialSpaceId(currentFinancialSpaceId);
      setCategories(userCategories);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro ao carregar categorias.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCategories]);

  async function onSubmit(data: CategoryFormData) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Configure sua Conta Clara antes de criar categorias.");
      return;
    }

    try {
      await createCategory({
        financialSpaceId,
        name: data.name,
        type: data.type,
      });

      setStatusType("success");
      setStatusMessage("Categoria criada com sucesso!");

      reset({
        name: "",
        type: "expense",
      });

      await loadCategories();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao criar categoria.",
      );
    }
  }

  return (
    <main>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
          Categorias
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Minhas categorias</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Organize suas receitas e despesas para entender melhor para onde seu
          dinheiro está indo.
        </p>
      </div>

      <section className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Nova categoria</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Crie categorias personalizadas para deixar seus lançamentos mais
            organizados.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-start"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Nome da categoria
            </label>

            <input
              id="name"
              type="text"
              placeholder="Ex: Investimentos, Pet, Lazer"
              {...register("name")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Tipo
            </label>

            <select
              id="type"
              {...register("type")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>

            {errors.type && (
              <p className="mt-2 text-sm text-red-400">{errors.type.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-7 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Criando..." : "Criar categoria"}
          </button>
        </form>

        {statusMessage && (
          <p
            className={`mt-5 rounded-xl px-4 py-3 text-center text-sm ${
              statusType === "success"
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-red-400/10 text-red-300"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </section>

      {isLoading && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-xl">
          <p className="text-sm text-zinc-400">Carregando categorias...</p>
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="rounded-3xl bg-red-400/10 p-6 text-center text-sm text-red-300">
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && categories.length === 0 && (
        <section className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/70 p-8 text-center shadow-xl">
          <h2 className="text-xl font-semibold">
            Nenhuma categoria encontrada
          </h2>

          <p className="mt-3 text-sm text-zinc-400">
            As categorias padrão serão criadas no onboarding.
          </p>
        </section>
      )}

      {!isLoading && !errorMessage && categories.length > 0 && (
        <section className="grid gap-6 lg:grid-cols-2">
          <CategoryGroup
            title="Receitas"
            description="Categorias usadas para entradas de dinheiro."
            categories={incomeCategories}
          />

          <CategoryGroup
            title="Despesas"
            description="Categorias usadas para gastos, contas e pagamentos."
            categories={expenseCategories}
          />
        </section>
      )}
    </main>
  );
}

type CategoryGroupProps = {
  title: string;
  description: string;
  categories: Category[];
};

function CategoryGroup({ title, description, categories }: CategoryGroupProps) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center">
          <p className="text-sm text-zinc-400">
            Nenhuma categoria cadastrada neste tipo.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color ?? "#71717a" }}
                />

                <div>
                  <p className="font-medium text-white">{category.name}</p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {category.is_default
                      ? "Categoria padrão"
                      : "Categoria criada"}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category.active
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {category.active ? "Ativa" : "Inativa"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
