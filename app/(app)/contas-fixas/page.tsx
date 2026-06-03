"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ban,
  CalendarClock,
  Check,
  CircleDollarSign,
  Plus,
  RotateCcw,
  Save,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { AppButton } from "@/components/ui/app-button";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppSection } from "@/components/ui/app-section";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import {
  formatMoneyInput,
  moneyInputToNumber,
  numberToMoneyInput,
} from "@/lib/utils/money";
import {
  fixedExpenseSchema,
  type FixedExpenseFormData,
} from "@/lib/validations/fixed-expense";
import { getActiveCategories, type Category } from "@/services/categories";
import {
  createFixedExpense,
  deleteFixedExpense,
  generateMonthlyTransactionsFromFixedExpenses,
  getFixedExpenses,
  type FixedExpense,
  updateFixedExpense,
  updateFixedExpenseActiveStatus,
} from "@/services/fixed-expenses";

const paymentMethodLabels: Record<FixedExpense["payment_method"], string> = {
  pix: "Pix",
  money: "Dinheiro",
  debit: "Débito",
  credit_card: "Cartão de crédito",
  bank_transfer: "Transferência bancária",
  boleto: "Boleto",
  other: "Outro",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getCurrentMonthValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export default function ContasFixasPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [fixedExpenseToDelete, setFixedExpenseToDelete] =
    useState<FixedExpense | null>(null);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [editingFixedExpenseId, setEditingFixedExpenseId] = useState<
    string | null
  >(null);
  const [updatingFixedExpenseId, setUpdatingFixedExpenseId] = useState<
    string | null
  >(null);
  const [referenceMonth, setReferenceMonth] = useState(getCurrentMonthValue());
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FixedExpenseFormData>({
    resolver: zodResolver(fixedExpenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      categoryId: "",
      dueDay: "",
      paymentMethod: "pix",
      notes: "",
    },
  });

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const activeFixedExpensesCount = fixedExpenses.filter(
    (fixedExpense) => fixedExpense.active,
  ).length;

  const fixedExpensesTotal = fixedExpenses
    .filter((fixedExpense) => fixedExpense.active)
    .reduce((total, fixedExpense) => total + Number(fixedExpense.amount), 0);

  const ensureFinancialSpaceId = useCallback(async () => {
    if (financialSpaceId) {
      return financialSpaceId;
    }

    const user = await getCurrentUser();

    if (!user) {
      setStatusType("error");
      setStatusMessage("Você precisa estar logado para acessar contas fixas.");
      return null;
    }

    const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

    if (!currentFinancialSpaceId) {
      setStatusType("error");
      setStatusMessage(
        "Não foi possível identificar sua Conta Clara. Verifique se o onboarding foi concluído.",
      );
      return null;
    }

    setFinancialSpaceId(currentFinancialSpaceId);

    return currentFinancialSpaceId;
  }, [financialSpaceId]);

  const loadFixedExpenses = useCallback(async () => {
    try {
      setStatusMessage("");
      setStatusType("");

      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage(
          "Você precisa estar logado para acessar contas fixas.",
        );
        return;
      }

      const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

      if (!currentFinancialSpaceId) {
        setStatusType("error");
        setStatusMessage(
          "Configure sua Conta Clara antes de cadastrar contas fixas.",
        );
        return;
      }

      const [userFixedExpenses, activeCategories] = await Promise.all([
        getFixedExpenses(currentFinancialSpaceId),
        getActiveCategories(currentFinancialSpaceId),
      ]);

      setFinancialSpaceId(currentFinancialSpaceId);
      setFixedExpenses(userFixedExpenses);
      setCategories(activeCategories);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar contas fixas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFixedExpenses();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadFixedExpenses]);

  function resetForm() {
    setEditingFixedExpenseId(null);

    reset({
      description: "",
      amount: "",
      categoryId: "",
      dueDay: "",
      paymentMethod: "pix",
      notes: "",
    });
  }

  function startEditingFixedExpense(fixedExpense: FixedExpense) {
    setStatusMessage("");
    setStatusType("");
    setEditingFixedExpenseId(fixedExpense.id);

    reset({
      description: fixedExpense.description,
      amount: numberToMoneyInput(fixedExpense.amount),
      categoryId: fixedExpense.category_id ?? "",
      dueDay: String(fixedExpense.due_day),
      paymentMethod: fixedExpense.payment_method,
      notes: fixedExpense.notes ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function onSubmit(data: FixedExpenseFormData) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      if (editingFixedExpenseId) {
        await updateFixedExpense({
          fixedExpenseId: editingFixedExpenseId,
          financialSpaceId: currentFinancialSpaceId,
          description: data.description,
          amount: moneyInputToNumber(data.amount),
          categoryId: data.categoryId || null,
          dueDay: Number(data.dueDay),
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Conta fixa atualizada com sucesso!");
      } else {
        await createFixedExpense({
          financialSpaceId: currentFinancialSpaceId,
          description: data.description,
          amount: moneyInputToNumber(data.amount),
          categoryId: data.categoryId || null,
          dueDay: Number(data.dueDay),
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Conta fixa criada com sucesso!");
      }

      resetForm();
      await loadFixedExpenses();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao salvar conta fixa.",
      );
    }
  }

  async function handleToggleFixedExpenseStatus(fixedExpense: FixedExpense) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingFixedExpenseId(fixedExpense.id);

      await updateFixedExpenseActiveStatus({
        fixedExpenseId: fixedExpense.id,
        financialSpaceId: currentFinancialSpaceId,
        active: !fixedExpense.active,
      });

      setStatusType("success");
      setStatusMessage(
        fixedExpense.active
          ? "Conta fixa desativada com sucesso!"
          : "Conta fixa reativada com sucesso!",
      );

      await loadFixedExpenses();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar conta fixa.",
      );
    } finally {
      setUpdatingFixedExpenseId(null);
    }
  }

  function openDeleteFixedExpenseModal(fixedExpense: FixedExpense) {
    setStatusMessage("");
    setStatusType("");
    setFixedExpenseToDelete(fixedExpense);
  }

  async function confirmDeleteFixedExpense() {
    if (!fixedExpenseToDelete) {
      return;
    }

    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingFixedExpenseId(fixedExpenseToDelete.id);

      await deleteFixedExpense({
        fixedExpenseId: fixedExpenseToDelete.id,
        financialSpaceId: currentFinancialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Conta fixa excluída com sucesso!");

      if (editingFixedExpenseId === fixedExpenseToDelete.id) {
        resetForm();
      }

      setFixedExpenseToDelete(null);

      await loadFixedExpenses();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao excluir conta fixa.",
      );
    } finally {
      setUpdatingFixedExpenseId(null);
    }
  }

  async function handleGenerateMonthlyTransactions() {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setIsGenerating(true);

      const result = await generateMonthlyTransactionsFromFixedExpenses({
        financialSpaceId: currentFinancialSpaceId,
        referenceMonth,
      });

      setStatusType("success");

      if (result.createdCount === 0 && result.skippedCount > 0) {
        setStatusMessage(
          "Nenhum lançamento novo foi gerado. As contas fixas deste mês já tinham sido criadas.",
        );
      } else {
        setStatusMessage(
          `${result.createdCount} lançamento(s) gerado(s) para o mês selecionado. ${result.skippedCount} já existia(m).`,
        );
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao gerar lançamentos do mês.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <AppSection>
          <AppLoadingState message="Carregando contas fixas..." />
        </AppSection>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Contas fixas
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Controle de contas fixas
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Cadastre despesas que se repetem todo mês e gere os lançamentos do mês
          automaticamente.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-blue-700">Contas ativas</p>
          <strong className="mt-3 block text-3xl font-black text-blue-700">
            {activeFixedExpensesCount}
          </strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Modelos ativos para gerar lançamentos mensais.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">Total previsto</p>
          <strong className="mt-3 block text-3xl font-black text-emerald-700">
            {formatCurrency(fixedExpensesTotal)}
          </strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Soma das contas fixas ativas cadastradas.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="referenceMonth"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Gerar lançamentos para
          </label>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
            <input
              id="referenceMonth"
              type="month"
              value={referenceMonth}
              onChange={(event) => setReferenceMonth(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => void handleGenerateMonthlyTransactions()}
              disabled={isGenerating || activeFixedExpensesCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarClock className="h-4 w-4" />
              {isGenerating ? "Gerando..." : "Gerar"}
            </button>
          </div>
        </div>
      </section>

      <AppSection
        title={editingFixedExpenseId ? "Editar conta fixa" : "Nova conta fixa"}
        description={
          editingFixedExpenseId
            ? "Atualize as informações da conta fixa selecionada."
            : "Cadastre uma despesa que se repete todos os meses."
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Descrição
            </label>

            <input
              id="description"
              type="text"
              placeholder="Ex: Internet, Aluguel, Energia"
              {...register("description")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.description && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Valor previsto
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(formatMoneyInput(event.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>

              {errors.amount && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dueDay"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Dia de vencimento
              </label>

              <input
                id="dueDay"
                type="number"
                min={1}
                max={31}
                placeholder="Ex: 10"
                {...register("dueDay")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {errors.dueDay && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.dueDay.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="paymentMethod"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Forma de pagamento
              </label>

              <select
                id="paymentMethod"
                {...register("paymentMethod")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="pix">Pix</option>
                <option value="money">Dinheiro</option>
                <option value="debit">Débito</option>
                <option value="credit_card">Cartão de crédito</option>
                <option value="bank_transfer">Transferência bancária</option>
                <option value="boleto">Boleto</option>
                <option value="other">Outro</option>
              </select>

              {errors.paymentMethod && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Categoria
            </label>

            <select
              id="categoryId"
              {...register("categoryId")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Sem categoria</option>

              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {expenseCategories.length === 0 && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Nenhuma categoria de despesa ativa encontrada. Você ainda pode
                criar a conta fixa sem categoria.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Observações
            </label>

            <textarea
              id="notes"
              placeholder="Adicione alguma observação, se necessário"
              {...register("notes")}
              className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.notes && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {editingFixedExpenseId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancelar edição
              </button>
            )}

            <AppButton type="submit" disabled={isSubmitting}>
              {editingFixedExpenseId ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {isSubmitting
                ? "Salvando..."
                : editingFixedExpenseId
                  ? "Salvar alterações"
                  : "Criar conta fixa"}
            </AppButton>
          </div>

          {statusMessage && statusType && (
            <AppFeedback type={statusType} message={statusMessage} />
          )}
        </form>
      </AppSection>

      <AppSection
        title="Lista de contas fixas"
        description={`${fixedExpenses.length} conta(s) fixa(s) cadastrada(s).`}
      >
        {fixedExpenses.length === 0 ? (
          <AppEmptyState
            variant="dashboard"
            eyebrow="Contas fixas"
            title="Nenhuma conta fixa cadastrada"
            description="Cadastre contas que se repetem todo mês, como internet, aluguel, energia ou assinaturas."
          />
        ) : (
          <div className="space-y-3">
            {fixedExpenses.map((fixedExpense) => {
              const category = categories.find(
                (currentCategory) =>
                  currentCategory.id === fixedExpense.category_id,
              );
              const isUpdating = updatingFixedExpenseId === fixedExpense.id;

              return (
                <div
                  key={fixedExpense.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] xl:items-center">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          fixedExpense.active
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <CircleDollarSign className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-950">
                            {fixedExpense.description}
                          </p>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              fixedExpense.active
                                ? "border-blue-100 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                            }`}
                          >
                            {fixedExpense.active ? "Ativa" : "Inativa"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {category?.name ?? "Sem categoria"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Valor
                      </p>
                      <p className="mt-1 text-sm font-black text-blue-700">
                        {formatCurrency(Number(fixedExpense.amount))}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Vence dia
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-700">
                        {String(fixedExpense.due_day).padStart(2, "0")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Pagamento
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-700">
                        {paymentMethodLabels[fixedExpense.payment_method]}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 xl:justify-end">
                      <button
                        type="button"
                        title="Editar conta fixa"
                        aria-label="Editar conta fixa"
                        onClick={() => startEditingFixedExpense(fixedExpense)}
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <SquarePen className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        title="Excluir conta fixa"
                        aria-label="Excluir conta fixa"
                        onClick={() =>
                          openDeleteFixedExpenseModal(fixedExpense)
                        }
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        title={
                          fixedExpense.active
                            ? "Desativar conta fixa"
                            : "Reativar conta fixa"
                        }
                        aria-label={
                          fixedExpense.active
                            ? "Desativar conta fixa"
                            : "Reativar conta fixa"
                        }
                        onClick={() =>
                          void handleToggleFixedExpenseStatus(fixedExpense)
                        }
                        disabled={isUpdating}
                        className={`inline-flex items-center justify-center rounded-2xl p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                          fixedExpense.active
                            ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        }`}
                      >
                        {isUpdating ? (
                          <span className="text-xs">...</span>
                        ) : fixedExpense.active ? (
                          <Ban className="h-5 w-5" />
                        ) : (
                          <RotateCcw className="h-5 w-5" />
                        )}
                      </button>

                      {editingFixedExpenseId === fixedExpense.id && (
                        <span className="inline-flex items-center justify-center rounded-2xl bg-blue-50 p-2 text-blue-600">
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppSection>
      {fixedExpenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-fixed-expense-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <div>
                <h2
                  id="delete-fixed-expense-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  Excluir conta fixa?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está prestes a excluir{" "}
                  <strong className="font-black text-slate-950">
                    {fixedExpenseToDelete.description}
                  </strong>
                  . Essa ação remove a conta fixa da lista e não poderá ser
                  desfeita.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">
                Os lançamentos que já foram gerados não serão apagados.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFixedExpenseToDelete(null)}
                disabled={updatingFixedExpenseId === fixedExpenseToDelete.id}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void confirmDeleteFixedExpense()}
                disabled={updatingFixedExpenseId === fixedExpenseToDelete.id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {updatingFixedExpenseId === fixedExpenseToDelete.id
                  ? "Excluindo..."
                  : "Excluir conta fixa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
