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
  updateCategoryActiveStatus,
  updateCategoryName,
} from "@/services/categories";

export default function CategoriasPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(
    null,
  );

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
      setIsLoading(true);
      setErrorMessage("");

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

  function startEditingCategory(category: Category) {
    setStatusMessage("");
    setStatusType("");
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }

  function cancelEditingCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  }

  async function handleUpdateCategoryName(categoryId: string) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    if (editingCategoryName.trim().length < 3) {
      setStatusType("error");
      setStatusMessage("O nome da categoria deve ter pelo menos 3 caracteres.");
      return;
    }

    try {
      setUpdatingCategoryId(categoryId);

      await updateCategoryName({
        categoryId,
        financialSpaceId,
        name: editingCategoryName.trim(),
      });

      setStatusType("success");
      setStatusMessage("Categoria atualizada com sucesso!");

      setEditingCategoryId(null);
      setEditingCategoryName("");

      await loadCategories();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao atualizar categoria.",
      );
    } finally {
      setUpdatingCategoryId(null);
    }
  }

  async function handleToggleCategoryStatus(category: Category) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      setUpdatingCategoryId(category.id);

      await updateCategoryActiveStatus({
        categoryId: category.id,
        financialSpaceId,
        active: !category.active,
      });

      setStatusType("success");
      setStatusMessage(
        category.active
          ? "Categoria desativada com sucesso!"
          : "Categoria reativada com sucesso!",
      );

      await loadCategories();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status da categoria.",
      );
    } finally {
      setUpdatingCategoryId(null);
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
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            updatingCategoryId={updatingCategoryId}
            onStartEditing={startEditingCategory}
            onCancelEditing={cancelEditingCategory}
            onChangeEditingName={setEditingCategoryName}
            onSaveEditing={handleUpdateCategoryName}
            onToggleStatus={handleToggleCategoryStatus}
          />

          <CategoryGroup
            title="Despesas"
            description="Categorias usadas para gastos, contas e pagamentos."
            categories={expenseCategories}
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            updatingCategoryId={updatingCategoryId}
            onStartEditing={startEditingCategory}
            onCancelEditing={cancelEditingCategory}
            onChangeEditingName={setEditingCategoryName}
            onSaveEditing={handleUpdateCategoryName}
            onToggleStatus={handleToggleCategoryStatus}
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
  editingCategoryId: string | null;
  editingCategoryName: string;
  updatingCategoryId: string | null;
  onStartEditing: (category: Category) => void;
  onCancelEditing: () => void;
  onChangeEditingName: (name: string) => void;
  onSaveEditing: (categoryId: string) => Promise<void>;
  onToggleStatus: (category: Category) => Promise<void>;
};

function CategoryGroup({
  title,
  description,
  categories,
  editingCategoryId,
  editingCategoryName,
  updatingCategoryId,
  onStartEditing,
  onCancelEditing,
  onChangeEditingName,
  onSaveEditing,
  onToggleStatus,
}: CategoryGroupProps) {
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
          {categories.map((category) => {
            const isEditing = editingCategoryId === category.id;
            const isUpdating = updatingCategoryId === category.id;

            return (
              <div
                key={category.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color ?? "#71717a" }}
                    />

                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(event) =>
                            onChangeEditingName(event.target.value)
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white transition outline-none focus:border-emerald-400"
                        />
                      ) : (
                        <p className="font-medium text-white">
                          {category.name}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-zinc-500">
                        {category.is_default
                          ? "Categoria padrão"
                          : "Categoria criada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        category.active
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {category.active ? "Ativa" : "Inativa"}
                    </span>

                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void onSaveEditing(category.id)}
                          disabled={isUpdating}
                          className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? "Salvando..." : "Salvar"}
                        </button>

                        <button
                          type="button"
                          onClick={onCancelEditing}
                          disabled={isUpdating}
                          className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartEditing(category)}
                          disabled={isUpdating}
                          className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void onToggleStatus(category)}
                          disabled={isUpdating}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            category.active
                              ? "border border-red-400/30 text-red-300 hover:bg-red-400/10"
                              : "bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                          }`}
                        >
                          {isUpdating
                            ? "Atualizando..."
                            : category.active
                              ? "Desativar"
                              : "Reativar"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
