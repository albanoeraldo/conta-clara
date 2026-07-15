"use client";

import { type ComponentType, useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { IconProps } from "@phosphor-icons/react";
import {
  BankIcon,
  BriefcaseIcon,
  CarIcon,
  CreditCardIcon,
  CurrencyCircleDollarIcon,
  DeviceMobileIcon,
  FilmSlateIcon,
  ForkKnifeIcon,
  GiftIcon,
  GraduationCapIcon,
  HeartbeatIcon,
  HouseIcon,
  LightbulbIcon,
  PawPrintIcon,
  PiggyBankIcon,
  ReceiptIcon,
  ShoppingCartIcon,
  WifiHighIcon,
} from "@phosphor-icons/react";
import { Ban, Check, Plus, RotateCcw, SquarePen, X } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
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

type CategoryIcon = ComponentType<IconProps>;

function normalizeCategoryName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCategoryIcon(category: Category): CategoryIcon {
  const name = normalizeCategoryName(category.name);

  if (category.type === "income") {
    if (
      name.includes("salario") ||
      name.includes("comissao") ||
      name.includes("trabalho") ||
      name.includes("servico")
    ) {
      return BriefcaseIcon;
    }

    if (
      name.includes("invest") ||
      name.includes("rendimento") ||
      name.includes("dividendo") ||
      name.includes("aplicacao")
    ) {
      return PiggyBankIcon;
    }

    if (
      name.includes("extra") ||
      name.includes("bonus") ||
      name.includes("freela") ||
      name.includes("freelancer")
    ) {
      return CurrencyCircleDollarIcon;
    }

    return CurrencyCircleDollarIcon;
  }

  if (
    name.includes("mercado") ||
    name.includes("supermercado") ||
    name.includes("compras")
  ) {
    return ShoppingCartIcon;
  }

  if (
    name.includes("alimentacao") ||
    name.includes("restaurante") ||
    name.includes("ifood") ||
    name.includes("lanche") ||
    name.includes("comida")
  ) {
    return ForkKnifeIcon;
  }

  if (
    name.includes("casa") ||
    name.includes("moradia") ||
    name.includes("aluguel") ||
    name.includes("condominio") ||
    name.includes("apartamento")
  ) {
    return HouseIcon;
  }

  if (
    name.includes("internet") ||
    name.includes("wifi") ||
    name.includes("telefone")
  ) {
    return WifiHighIcon;
  }

  if (name.includes("celular")) {
    return DeviceMobileIcon;
  }

  if (name.includes("energia") || name.includes("luz")) {
    return LightbulbIcon;
  }

  if (
    name.includes("transporte") ||
    name.includes("combustivel") ||
    name.includes("uber") ||
    name.includes("carro") ||
    name.includes("onibus")
  ) {
    return CarIcon;
  }

  if (
    name.includes("cartao") ||
    name.includes("credito") ||
    name.includes("fatura")
  ) {
    return CreditCardIcon;
  }

  if (name.includes("pet") || name.includes("animal")) {
    return PawPrintIcon;
  }

  if (
    name.includes("saude") ||
    name.includes("farmacia") ||
    name.includes("medico") ||
    name.includes("hospital")
  ) {
    return HeartbeatIcon;
  }

  if (
    name.includes("curso") ||
    name.includes("faculdade") ||
    name.includes("estudo") ||
    name.includes("escola") ||
    name.includes("educacao")
  ) {
    return GraduationCapIcon;
  }

  if (
    name.includes("lazer") ||
    name.includes("netflix") ||
    name.includes("streaming") ||
    name.includes("cinema") ||
    name.includes("assinatura")
  ) {
    return FilmSlateIcon;
  }

  if (name.includes("presente")) {
    return GiftIcon;
  }

  if (
    name.includes("banco") ||
    name.includes("taxa") ||
    name.includes("tarifa")
  ) {
    return BankIcon;
  }

  return ReceiptIcon;
}

function getCategoryAccentColor(category: Category) {
  if (category.color) {
    return category.color;
  }

  return category.type === "income" ? "#10b981" : "#2563eb";
}

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
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Categorias
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Minhas categorias
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Organize suas receitas e despesas para entender melhor para onde seu
          dinheiro está indo.
        </p>
      </div>

      <AppSection
        title="Nova categoria"
        description="Crie categorias personalizadas para deixar seus lançamentos mais organizados."
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-start"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Nome da categoria
            </label>

            <input
              id="name"
              type="text"
              placeholder="Ex: Investimentos, Pet, Lazer"
              {...register("name")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.name && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Tipo
            </label>

            <select
              id="type"
              {...register("type")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>

            {errors.type && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.type.message}
              </p>
            )}
          </div>

          <AppButton type="submit" disabled={isSubmitting} className="mt-7">
            <Plus className="h-4 w-4" />
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
            variant="categories"
            title="Nenhuma categoria encontrada"
            description="As categorias ajudam você a entender melhor para onde o dinheiro vai. Crie categorias para organizar receitas e despesas do seu jeito."
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
          variant="categories"
          eyebrow="Categorias"
          title="Nenhuma categoria neste tipo"
          description="Quando você criar categorias para este tipo, elas aparecerão aqui para facilitar a organização dos seus lançamentos."
        />
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const isEditing = editingCategoryId === category.id;
            const isUpdating = updatingCategoryId === category.id;
            const Icon = getCategoryIcon(category);
            const accentColor = getCategoryAccentColor(category);

            return (
              <div
                key={category.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm ring-4 ring-white"
                      style={{
                        borderColor: accentColor,
                        backgroundColor: `${accentColor}14`,
                      }}
                    >
                      <Icon
                        size={23}
                        weight="duotone"
                        style={{ color: accentColor }}
                      />
                    </div>

                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(event) =>
                            onChangeEditingName(event.target.value)
                          }
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-950">
                            {category.name}
                          </p>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              category.active
                                ? "border-blue-100 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                            }`}
                          >
                            {category.active ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      )}

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {category.is_default
                          ? "Categoria padrão"
                          : "Categoria criada"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          title="Salvar categoria"
                          aria-label="Salvar categoria"
                          onClick={() => void onSaveEditing(category.id)}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center rounded-2xl bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <Check className="h-5 w-5" />
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
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <X className="h-5 w-5" />
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
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <SquarePen className="h-5 w-5" />
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
                          className={`inline-flex items-center justify-center rounded-2xl p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
                            category.active
                              ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          }`}
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : category.active ? (
                            <>
                              <Ban className="h-5 w-5" />
                              <span className="sr-only">Desativar</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-5 w-5" />
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
