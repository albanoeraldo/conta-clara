"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ban,
  CalendarClock,
  Check,
  Landmark,
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
  installmentPlanSchema,
  type InstallmentPlanFormData,
} from "@/lib/validations/installment-plan";
import { getActiveCategories, type Category } from "@/services/categories";
import {
  createInstallmentPlan,
  deleteInstallmentPlan,
  generateMonthlyTransactionsFromInstallmentPlans,
  getInstallmentPlanProgress,
  getInstallmentPlans,
  type InstallmentPlan,
  updateInstallmentPlan,
  updateInstallmentPlanActiveStatus,
} from "@/services/installment-plans";

const paymentMethodLabels: Record<InstallmentPlan["payment_method"], string> = {
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getCurrentMonthValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function isInstallmentPlanAvailableForMonth(
  installmentPlan: InstallmentPlan,
  referenceMonth: string,
) {
  const progress = getInstallmentPlanProgress(installmentPlan, referenceMonth);

  return (
    installmentPlan.active &&
    progress.currentInstallment >= installmentPlan.first_installment_number &&
    !progress.isFinished
  );
}

function getProgressLabel(
  installmentPlan: InstallmentPlan,
  referenceMonth: string,
) {
  const progress = getInstallmentPlanProgress(installmentPlan, referenceMonth);

  if (progress.currentInstallment < installmentPlan.first_installment_number) {
    return "Ainda não iniciou";
  }

  if (progress.isFinished) {
    return "Finalizado";
  }

  return `Parcela ${progress.currentInstallment}/${installmentPlan.total_installments}`;
}

export default function ParcelamentosPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(
    [],
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [editingInstallmentPlanId, setEditingInstallmentPlanId] = useState<
    string | null
  >(null);
  const [updatingInstallmentPlanId, setUpdatingInstallmentPlanId] = useState<
    string | null
  >(null);
  const [installmentPlanToDelete, setInstallmentPlanToDelete] =
    useState<InstallmentPlan | null>(null);
  const [referenceMonth, setReferenceMonth] = useState(getCurrentMonthValue());
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InstallmentPlanFormData>({
    resolver: zodResolver(installmentPlanSchema),
    defaultValues: {
      description: "",
      installmentAmount: "",
      categoryId: "",
      firstDueDate: "",
      totalInstallments: "",
      firstInstallmentNumber: "1",
      paymentMethod: "pix",
      notes: "",
    },
  });

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const activePlansForSelectedMonth = installmentPlans.filter(
    (installmentPlan) =>
      isInstallmentPlanAvailableForMonth(installmentPlan, referenceMonth),
  );

  const activePlansCount = activePlansForSelectedMonth.length;

  const monthlyInstallmentTotal = activePlansForSelectedMonth.reduce(
    (total, installmentPlan) =>
      total + Number(installmentPlan.installment_amount),
    0,
  );

  const ensureFinancialSpaceId = useCallback(async () => {
    if (financialSpaceId) {
      return financialSpaceId;
    }

    const user = await getCurrentUser();

    if (!user) {
      setStatusType("error");
      setStatusMessage("Você precisa estar logado para acessar parcelamentos.");
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

  const loadInstallmentPlans = useCallback(async () => {
    try {
      setStatusMessage("");
      setStatusType("");

      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage(
          "Você precisa estar logado para acessar parcelamentos.",
        );
        return;
      }

      const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

      if (!currentFinancialSpaceId) {
        setStatusType("error");
        setStatusMessage(
          "Configure sua Conta Clara antes de cadastrar parcelamentos.",
        );
        return;
      }

      const [userInstallmentPlans, activeCategories] = await Promise.all([
        getInstallmentPlans(currentFinancialSpaceId),
        getActiveCategories(currentFinancialSpaceId),
      ]);

      setFinancialSpaceId(currentFinancialSpaceId);
      setInstallmentPlans(userInstallmentPlans);
      setCategories(activeCategories);
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar parcelamentos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadInstallmentPlans();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadInstallmentPlans]);

  function resetForm() {
    setEditingInstallmentPlanId(null);

    reset({
      description: "",
      installmentAmount: "",
      categoryId: "",
      firstDueDate: "",
      totalInstallments: "",
      firstInstallmentNumber: "1",
      paymentMethod: "pix",
      notes: "",
    });
  }

  function startEditingInstallmentPlan(installmentPlan: InstallmentPlan) {
    setStatusMessage("");
    setStatusType("");
    setEditingInstallmentPlanId(installmentPlan.id);

    reset({
      description: installmentPlan.description,
      installmentAmount: numberToMoneyInput(installmentPlan.installment_amount),
      categoryId: installmentPlan.category_id ?? "",
      firstDueDate: installmentPlan.first_due_date,
      totalInstallments: String(installmentPlan.total_installments),
      firstInstallmentNumber: String(installmentPlan.first_installment_number),
      paymentMethod: installmentPlan.payment_method,
      notes: installmentPlan.notes ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function onSubmit(data: InstallmentPlanFormData) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      if (editingInstallmentPlanId) {
        await updateInstallmentPlan({
          installmentPlanId: editingInstallmentPlanId,
          financialSpaceId: currentFinancialSpaceId,
          description: data.description,
          installmentAmount: moneyInputToNumber(data.installmentAmount),
          categoryId: data.categoryId || null,
          firstDueDate: data.firstDueDate,
          totalInstallments: Number(data.totalInstallments),
          firstInstallmentNumber: Number(data.firstInstallmentNumber),
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Parcelamento atualizado com sucesso!");
      } else {
        await createInstallmentPlan({
          financialSpaceId: currentFinancialSpaceId,
          description: data.description,
          installmentAmount: moneyInputToNumber(data.installmentAmount),
          categoryId: data.categoryId || null,
          firstDueDate: data.firstDueDate,
          totalInstallments: Number(data.totalInstallments),
          firstInstallmentNumber: Number(data.firstInstallmentNumber),
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Parcelamento criado com sucesso!");
      }

      resetForm();
      await loadInstallmentPlans();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao salvar parcelamento.",
      );
    }
  }

  async function handleToggleInstallmentPlanStatus(
    installmentPlan: InstallmentPlan,
  ) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingInstallmentPlanId(installmentPlan.id);

      await updateInstallmentPlanActiveStatus({
        installmentPlanId: installmentPlan.id,
        financialSpaceId: currentFinancialSpaceId,
        active: !installmentPlan.active,
      });

      setStatusType("success");
      setStatusMessage(
        installmentPlan.active
          ? "Parcelamento desativado com sucesso!"
          : "Parcelamento reativado com sucesso!",
      );

      await loadInstallmentPlans();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar parcelamento.",
      );
    } finally {
      setUpdatingInstallmentPlanId(null);
    }
  }

  function openDeleteInstallmentPlanModal(installmentPlan: InstallmentPlan) {
    setStatusMessage("");
    setStatusType("");
    setInstallmentPlanToDelete(installmentPlan);
  }

  async function confirmDeleteInstallmentPlan() {
    if (!installmentPlanToDelete) {
      return;
    }

    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingInstallmentPlanId(installmentPlanToDelete.id);

      await deleteInstallmentPlan({
        installmentPlanId: installmentPlanToDelete.id,
        financialSpaceId: currentFinancialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Parcelamento excluído com sucesso!");

      if (editingInstallmentPlanId === installmentPlanToDelete.id) {
        resetForm();
      }

      setInstallmentPlanToDelete(null);

      await loadInstallmentPlans();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao excluir parcelamento.",
      );
    } finally {
      setUpdatingInstallmentPlanId(null);
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

      const result = await generateMonthlyTransactionsFromInstallmentPlans({
        financialSpaceId: currentFinancialSpaceId,
        referenceMonth,
      });

      setStatusType("success");

      if (
        result.createdCount === 0 &&
        result.skippedCount > 0 &&
        result.finishedCount === 0
      ) {
        setStatusMessage(
          "Nenhum lançamento novo foi gerado. Os parcelamentos deste mês já tinham sido criados.",
        );
      } else {
        setStatusMessage(
          `${result.createdCount} lançamento(s) gerado(s). ${result.skippedCount} já existia(m). ${result.finishedCount} parcelamento(s) finalizado(s) ou fora do mês.`,
        );
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao gerar lançamentos dos parcelamentos.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <AppSection>
          <AppLoadingState message="Carregando parcelamentos..." />
        </AppSection>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Parcelamentos
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Parcelamentos e financiamentos
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Cadastre compromissos com começo, quantidade de parcelas e fim
          previsto.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-blue-700">
            Parcelamentos ativos
          </p>
          <strong className="mt-3 block text-3xl font-black text-blue-700">
            {activePlansCount}
          </strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Parcelamentos que ainda geram parcelas no mês selecionado.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">Total do mês</p>
          <strong className="mt-3 block text-3xl font-black text-emerald-700">
            {formatCurrency(monthlyInstallmentTotal)}
          </strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Soma das parcelas válidas para o mês selecionado.
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
              disabled={isGenerating || activePlansCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CalendarClock className="h-4 w-4" />
              {isGenerating ? "Gerando..." : "Gerar"}
            </button>
          </div>
        </div>
      </section>

      <AppSection
        title={
          editingInstallmentPlanId ? "Editar parcelamento" : "Novo parcelamento"
        }
        description={
          editingInstallmentPlanId
            ? "Atualize as informações do parcelamento selecionado."
            : "Cadastre um financiamento, empréstimo ou compra parcelada."
        }
        headerAside={
          !editingInstallmentPlanId ? (
            <div className="rounded-3xl border border-blue-100 bg-blue-50 px-5 py-4 shadow-sm">
              <p className="text-sm font-black tracking-[0.2em] text-blue-700 uppercase">
                Como preencher
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Se em junho/2026 você está pagando a parcela 20, informe a data
                de junho e o número 20.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Para parcelamentos novos, use a primeira data e parcela 1.
              </p>
            </div>
          ) : null
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
              placeholder="Ex: Financiamento carro, Empréstimo, Celular"
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
                htmlFor="installmentAmount"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Valor da parcela
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>

                <Controller
                  control={control}
                  name="installmentAmount"
                  render={({ field }) => (
                    <input
                      id="installmentAmount"
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

              {errors.installmentAmount && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.installmentAmount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="firstDueDate"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Data da parcela de referência
              </label>

              <input
                id="firstDueDate"
                type="date"
                {...register("firstDueDate")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {errors.firstDueDate && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.firstDueDate.message}
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

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="totalInstallments"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Total de parcelas
              </label>

              <input
                id="totalInstallments"
                type="number"
                min={1}
                placeholder="Ex: 48"
                {...register("totalInstallments")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {errors.totalInstallments && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.totalInstallments.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="firstInstallmentNumber"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Nº da parcela nessa data
              </label>

              <input
                id="firstInstallmentNumber"
                type="number"
                min={1}
                placeholder="Ex: 1"
                {...register("firstInstallmentNumber")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {errors.firstInstallmentNumber && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.firstInstallmentNumber.message}
                </p>
              )}
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
                  criar o parcelamento sem categoria.
                </p>
              )}
            </div>
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
            {editingInstallmentPlanId && (
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
              {editingInstallmentPlanId ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {isSubmitting
                ? "Salvando..."
                : editingInstallmentPlanId
                  ? "Salvar alterações"
                  : "Criar parcelamento"}
            </AppButton>
          </div>

          {statusMessage && statusType && (
            <AppFeedback type={statusType} message={statusMessage} />
          )}
        </form>
      </AppSection>

      <AppSection
        title="Lista de parcelamentos"
        description={`${installmentPlans.length} parcelamento(s) cadastrado(s).`}
      >
        {installmentPlans.length === 0 ? (
          <AppEmptyState
            variant="dashboard"
            eyebrow="Parcelamentos"
            title="Nenhum parcelamento cadastrado"
            description="Cadastre financiamentos, empréstimos ou compras parceladas para acompanhar parcelas atuais, restantes e data final."
          />
        ) : (
          <div className="space-y-3">
            {installmentPlans.map((installmentPlan) => {
              const category = categories.find(
                (currentCategory) =>
                  currentCategory.id === installmentPlan.category_id,
              );
              const isUpdating =
                updatingInstallmentPlanId === installmentPlan.id;
              const progress = getInstallmentPlanProgress(
                installmentPlan,
                referenceMonth,
              );
              const isAvailableForMonth = isInstallmentPlanAvailableForMonth(
                installmentPlan,
                referenceMonth,
              );

              return (
                <div
                  key={installmentPlan.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="grid gap-4 xl:grid-cols-5 xl:items-center">
                    <div className="xl:col-span-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            installmentPlan.active
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <Landmark className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-950">
                              {installmentPlan.description}
                            </p>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${
                                installmentPlan.active
                                  ? "border-blue-100 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                              }`}
                            >
                              {installmentPlan.active ? "Ativo" : "Inativo"}
                            </span>

                            {!isAvailableForMonth && installmentPlan.active && (
                              <span className="rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1 text-xs font-black text-yellow-700">
                                {progress.isFinished
                                  ? "Finalizado"
                                  : "Fora do mês"}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {category?.name ?? "Sem categoria"}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Final previsto: {formatDate(progress.finalDueDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Parcela
                      </p>
                      <p className="mt-1 text-sm font-black text-blue-700">
                        {getProgressLabel(installmentPlan, referenceMonth)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        Restam {progress.remainingInstallments}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Valor
                      </p>
                      <p className="mt-1 text-sm font-black text-blue-700">
                        {formatCurrency(
                          Number(installmentPlan.installment_amount),
                        )}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {paymentMethodLabels[installmentPlan.payment_method]}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 xl:justify-end">
                      <button
                        type="button"
                        title="Editar parcelamento"
                        aria-label="Editar parcelamento"
                        onClick={() =>
                          startEditingInstallmentPlan(installmentPlan)
                        }
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <SquarePen className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        title="Excluir parcelamento"
                        aria-label="Excluir parcelamento"
                        onClick={() =>
                          openDeleteInstallmentPlanModal(installmentPlan)
                        }
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        title={
                          installmentPlan.active
                            ? "Desativar parcelamento"
                            : "Reativar parcelamento"
                        }
                        aria-label={
                          installmentPlan.active
                            ? "Desativar parcelamento"
                            : "Reativar parcelamento"
                        }
                        onClick={() =>
                          void handleToggleInstallmentPlanStatus(
                            installmentPlan,
                          )
                        }
                        disabled={isUpdating}
                        className={`inline-flex items-center justify-center rounded-2xl p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                          installmentPlan.active
                            ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        }`}
                      >
                        {isUpdating ? (
                          <span className="text-xs">...</span>
                        ) : installmentPlan.active ? (
                          <Ban className="h-5 w-5" />
                        ) : (
                          <RotateCcw className="h-5 w-5" />
                        )}
                      </button>

                      {editingInstallmentPlanId === installmentPlan.id && (
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

      {installmentPlanToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-installment-plan-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <div>
                <h2
                  id="delete-installment-plan-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  Excluir parcelamento?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está prestes a excluir{" "}
                  <strong className="font-black text-slate-950">
                    {installmentPlanToDelete.description}
                  </strong>
                  . Essa ação remove o parcelamento da lista e não poderá ser
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
                onClick={() => setInstallmentPlanToDelete(null)}
                disabled={
                  updatingInstallmentPlanId === installmentPlanToDelete.id
                }
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void confirmDeleteInstallmentPlan()}
                disabled={
                  updatingInstallmentPlanId === installmentPlanToDelete.id
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {updatingInstallmentPlanId === installmentPlanToDelete.id
                  ? "Excluindo..."
                  : "Excluir parcelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
