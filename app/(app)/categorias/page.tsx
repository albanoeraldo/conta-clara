"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, Check, RotateCcw, SquarePen, X } from "lucide-react";
import { useForm } from "react-hook-form";

import { AppEmptyState } from "@/components/ui/app-empty-state";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppButton } from "@/components/ui/app-button";
import { AppSection } from "@/components/ui/app-section";
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

      <AppSection
        title="Nova categoria"
        description="Crie categorias personalizadas para deixar seus lançamentos mais organizados."
        className="mb-8"
      >
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

          <AppButton type="submit" disabled={isSubmitting} className="mt-7">
            {isSubmitting ? "Criando..." : "Criar categoria"}
          </AppButton>
        </form>

        {statusMessage && statusType && (
          <AppFeedback
            type={statusType}
            message={statusMessage}
            className="mt-5"
          />
        )}
      </AppSection>

      {isLoading && (
        <AppSection>
          <AppLoadingState message="Carregando categorias..." />
        </AppSection>
      )}

      {!isLoading && errorMessage && (
        <AppFeedback type="error" message={errorMessage} />
      )}

      {!isLoading && !errorMessage && categories.length === 0 && (
        <AppSection>
          <AppEmptyState
            title="Nenhuma categoria encontrada"
            description="As categorias padrão serão criadas no onboarding. Você também pode criar categorias personalizadas para organizar melhor seus lançamentos."
          />
        </AppSection>
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
    <AppSection title={title} description={description}>
      {categories.length === 0 ? (
        <AppEmptyState
          title="Nenhuma categoria neste tipo"
          description="Quando houver categorias cadastradas para este tipo, elas aparecerão aqui."
        />
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

                  <div className="flex items-center gap-4 sm:justify-end">
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
                          title="Salvar categoria"
                          aria-label="Salvar categoria"
                          onClick={() => void onSaveEditing(category.id)}
                          disabled={isUpdating}
                          className="inline-flex cursor-pointer items-center justify-center p-1.5 text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <Check className="h-6 w-6" />
                              <span className="sr-only">Salvar</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          title="Cancelar edição"
                          aria-label="Cancelar edição"
                          onClick={onCancelEditing}
                          disabled={isUpdating}
                          className="inline-flex cursor-pointer items-center justify-center p-1.5 text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="h-6 w-6" />
                          <span className="sr-only">Cancelar</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          title="Editar categoria"
                          aria-label="Editar categoria"
                          onClick={() => onStartEditing(category)}
                          disabled={isUpdating}
                          className="inline-flex cursor-pointer items-center justify-center p-1.5 text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <SquarePen className="h-6 w-6" />
                          <span className="sr-only">Editar</span>
                        </button>

                        <button
                          type="button"
                          title={
                            category.active
                              ? "Desativar categoria"
                              : "Reativar categoria"
                          }
                          aria-label={
                            category.active
                              ? "Desativar categoria"
                              : "Reativar categoria"
                          }
                          onClick={() => void onToggleStatus(category)}
                          disabled={isUpdating}
                          className={`inline-flex cursor-pointer items-center justify-center p-1.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            category.active
                              ? "text-red-400 hover:text-red-300"
                              : "text-emerald-400 hover:text-emerald-300"
                          }`}
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : category.active ? (
                            <>
                              <Ban className="h-6 w-6" />
                              <span className="sr-only">Desativar</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-6 w-6" />
                              <span className="sr-only">Reativar</span>
                            </>
                          )}
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
    </AppSection>
  );
}
