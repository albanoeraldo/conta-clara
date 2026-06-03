"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Ban,
  CalendarClock,
  Check,
  CreditCard as CreditCardIcon,
  FileText,
  Plus,
  Receipt,
  RotateCcw,
  Save,
  ShoppingBag,
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
  creditCardSchema,
  type CreditCardFormData,
} from "@/lib/validations/credit-card";
import {
  creditCardPurchaseSchema,
  type CreditCardPurchaseFormData,
} from "@/lib/validations/credit-card-purchase";
import { getActiveCategories, type Category } from "@/services/categories";
import {
  createCreditCard,
  createCreditCardPurchase,
  deleteCreditCard,
  deleteCreditCardPurchase,
  generateCreditCardStatementTransaction,
  getCreditCardDisplayName,
  getCreditCards,
  getCreditCardPurchases,
  getCreditCardStatementItems,
  type CreditCard,
  type CreditCardPurchase,
  updateCreditCard,
  updateCreditCardActiveStatus,
  updateCreditCardPurchase,
  updateCreditCardPurchaseStatus,
} from "@/services/credit-cards";

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

function getSafeDate(referenceMonth: string, day: number) {
  const [yearValue, monthValue] = referenceMonth.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, lastDayOfMonth);

  return `${referenceMonth}-${String(safeDay).padStart(2, "0")}`;
}

const purchaseStatusLabels: Record<CreditCardPurchase["status"], string> = {
  active: "Ativa",
  cancelled: "Cancelada",
};

export default function CartoesPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCreditCardId, setSelectedCreditCardId] = useState("");
  const [referenceMonth, setReferenceMonth] = useState(getCurrentMonthValue());
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingStatement, setIsGeneratingStatement] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [editingCreditCardId, setEditingCreditCardId] = useState<string | null>(
    null,
  );
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(
    null,
  );
  const [updatingCreditCardId, setUpdatingCreditCardId] = useState<
    string | null
  >(null);
  const [updatingPurchaseId, setUpdatingPurchaseId] = useState<string | null>(
    null,
  );
  const [creditCardToDelete, setCreditCardToDelete] =
    useState<CreditCard | null>(null);
  const [purchaseToDelete, setPurchaseToDelete] =
    useState<CreditCardPurchase | null>(null);

  const {
    register: registerCard,
    handleSubmit: handleSubmitCard,
    reset: resetCard,
    control: cardControl,
    formState: { errors: cardErrors, isSubmitting: isSubmittingCard },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: "",
      nickname: "",
      limitAmount: "",
      closingDay: "",
      dueDay: "",
      brand: "",
      notes: "",
    },
  });

  const {
    register: registerPurchase,
    handleSubmit: handleSubmitPurchase,
    reset: resetPurchase,
    control: purchaseControl,
    setValue: setPurchaseValue,
    formState: { errors: purchaseErrors, isSubmitting: isSubmittingPurchase },
  } = useForm<CreditCardPurchaseFormData>({
    resolver: zodResolver(creditCardPurchaseSchema),
    defaultValues: {
      creditCardId: "",
      description: "",
      totalAmount: "",
      categoryId: "",
      purchaseDate: "",
      installmentsTotal: "1",
      firstInstallmentNumber: "1",
      notes: "",
    },
  });

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const activeCreditCardsCount = creditCards.filter(
    (creditCard) => creditCard.active,
  ).length;

  const selectedCreditCard =
    creditCards.find((creditCard) => creditCard.id === selectedCreditCardId) ??
    null;

  const selectedCreditCardPurchases = purchases.filter(
    (purchase) => purchase.credit_card_id === selectedCreditCardId,
  );

  const statementItems = selectedCreditCard
    ? getCreditCardStatementItems({
        creditCard: selectedCreditCard,
        purchases: selectedCreditCardPurchases,
        referenceMonth,
      })
    : [];

  const statementTotal = statementItems.reduce(
    (total, item) => total + item.installmentAmount,
    0,
  );

  const statementDueDate = selectedCreditCard
    ? getSafeDate(referenceMonth, selectedCreditCard.due_day)
    : "";

  const availableLimit =
    selectedCreditCard?.limit_amount !== null &&
    selectedCreditCard?.limit_amount !== undefined
      ? Number(selectedCreditCard.limit_amount) - statementTotal
      : null;

  const ensureFinancialSpaceId = useCallback(async () => {
    if (financialSpaceId) {
      return financialSpaceId;
    }

    const user = await getCurrentUser();

    if (!user) {
      setStatusType("error");
      setStatusMessage("Você precisa estar logado para acessar cartões.");
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

  const loadCreditCardData = useCallback(async () => {
    try {
      setStatusMessage("");
      setStatusType("");

      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage("Você precisa estar logado para acessar cartões.");
        return;
      }

      const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

      if (!currentFinancialSpaceId) {
        setStatusType("error");
        setStatusMessage(
          "Configure sua Conta Clara antes de cadastrar cartões.",
        );
        return;
      }

      const [userCreditCards, userPurchases, activeCategories] =
        await Promise.all([
          getCreditCards(currentFinancialSpaceId),
          getCreditCardPurchases(currentFinancialSpaceId),
          getActiveCategories(currentFinancialSpaceId),
        ]);

      setFinancialSpaceId(currentFinancialSpaceId);
      setCreditCards(userCreditCards);
      setPurchases(userPurchases);
      setCategories(activeCategories);

      setSelectedCreditCardId((currentSelectedCreditCardId) => {
        if (
          currentSelectedCreditCardId &&
          userCreditCards.some(
            (creditCard) => creditCard.id === currentSelectedCreditCardId,
          )
        ) {
          return currentSelectedCreditCardId;
        }

        return userCreditCards[0]?.id ?? "";
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao carregar cartões.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCreditCardData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCreditCardData]);

  useEffect(() => {
    if (selectedCreditCardId && !editingPurchaseId) {
      setPurchaseValue("creditCardId", selectedCreditCardId);
    }
  }, [editingPurchaseId, selectedCreditCardId, setPurchaseValue]);

  function resetCardForm() {
    setEditingCreditCardId(null);

    resetCard({
      name: "",
      nickname: "",
      limitAmount: "",
      closingDay: "",
      dueDay: "",
      brand: "",
      notes: "",
    });
  }

  function resetPurchaseForm() {
    setEditingPurchaseId(null);

    resetPurchase({
      creditCardId: selectedCreditCardId,
      description: "",
      totalAmount: "",
      categoryId: "",
      purchaseDate: "",
      installmentsTotal: "1",
      firstInstallmentNumber: "1",
      notes: "",
    });
  }

  function startEditingCreditCard(creditCard: CreditCard) {
    setStatusMessage("");
    setStatusType("");
    setEditingCreditCardId(creditCard.id);

    resetCard({
      name: creditCard.name,
      nickname: creditCard.nickname ?? "",
      limitAmount:
        creditCard.limit_amount !== null
          ? numberToMoneyInput(creditCard.limit_amount)
          : "",
      closingDay: String(creditCard.closing_day),
      dueDay: String(creditCard.due_day),
      brand: creditCard.brand ?? "",
      notes: creditCard.notes ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEditingPurchase(purchase: CreditCardPurchase) {
    setStatusMessage("");
    setStatusType("");
    setEditingPurchaseId(purchase.id);
    setSelectedCreditCardId(purchase.credit_card_id);

    resetPurchase({
      creditCardId: purchase.credit_card_id,
      description: purchase.description,
      totalAmount: numberToMoneyInput(purchase.total_amount),
      categoryId: purchase.category_id ?? "",
      purchaseDate: purchase.purchase_date,
      installmentsTotal: String(purchase.installments_total),
      firstInstallmentNumber: String(purchase.first_installment_number),
      notes: purchase.notes ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function onSubmitCard(data: CreditCardFormData) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      if (editingCreditCardId) {
        await updateCreditCard({
          creditCardId: editingCreditCardId,
          financialSpaceId: currentFinancialSpaceId,
          name: data.name,
          nickname: data.nickname || null,
          limitAmount: data.limitAmount
            ? moneyInputToNumber(data.limitAmount)
            : null,
          closingDay: Number(data.closingDay),
          dueDay: Number(data.dueDay),
          brand: data.brand || null,
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Cartão atualizado com sucesso!");
      } else {
        const createdCreditCard = await createCreditCard({
          financialSpaceId: currentFinancialSpaceId,
          name: data.name,
          nickname: data.nickname || null,
          limitAmount: data.limitAmount
            ? moneyInputToNumber(data.limitAmount)
            : null,
          closingDay: Number(data.closingDay),
          dueDay: Number(data.dueDay),
          brand: data.brand || null,
          notes: data.notes || null,
        });

        setSelectedCreditCardId(createdCreditCard.id);
        setStatusType("success");
        setStatusMessage("Cartão criado com sucesso!");
      }

      resetCardForm();
      await loadCreditCardData();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao salvar cartão.",
      );
    }
  }

  async function onSubmitPurchase(data: CreditCardPurchaseFormData) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      if (editingPurchaseId) {
        await updateCreditCardPurchase({
          purchaseId: editingPurchaseId,
          financialSpaceId: currentFinancialSpaceId,
          creditCardId: data.creditCardId,
          description: data.description,
          totalAmount: moneyInputToNumber(data.totalAmount),
          categoryId: data.categoryId || null,
          purchaseDate: data.purchaseDate,
          installmentsTotal: Number(data.installmentsTotal),
          firstInstallmentNumber: Number(data.firstInstallmentNumber),
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Compra atualizada com sucesso!");
      } else {
        await createCreditCardPurchase({
          financialSpaceId: currentFinancialSpaceId,
          creditCardId: data.creditCardId,
          description: data.description,
          totalAmount: moneyInputToNumber(data.totalAmount),
          categoryId: data.categoryId || null,
          purchaseDate: data.purchaseDate,
          installmentsTotal: Number(data.installmentsTotal),
          firstInstallmentNumber: Number(data.firstInstallmentNumber),
          notes: data.notes || null,
        });

        setStatusType("success");
        setStatusMessage("Compra cadastrada com sucesso!");
      }

      resetPurchaseForm();
      await loadCreditCardData();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao salvar compra no cartão.",
      );
    }
  }

  async function handleToggleCreditCardStatus(creditCard: CreditCard) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingCreditCardId(creditCard.id);

      await updateCreditCardActiveStatus({
        creditCardId: creditCard.id,
        financialSpaceId: currentFinancialSpaceId,
        active: !creditCard.active,
      });

      setStatusType("success");
      setStatusMessage(
        creditCard.active
          ? "Cartão desativado com sucesso!"
          : "Cartão reativado com sucesso!",
      );

      await loadCreditCardData();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao atualizar cartão.",
      );
    } finally {
      setUpdatingCreditCardId(null);
    }
  }

  async function handleTogglePurchaseStatus(purchase: CreditCardPurchase) {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingPurchaseId(purchase.id);

      await updateCreditCardPurchaseStatus({
        purchaseId: purchase.id,
        financialSpaceId: currentFinancialSpaceId,
        status: purchase.status === "active" ? "cancelled" : "active",
      });

      setStatusType("success");
      setStatusMessage(
        purchase.status === "active"
          ? "Compra cancelada com sucesso!"
          : "Compra reativada com sucesso!",
      );

      await loadCreditCardData();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao atualizar compra.",
      );
    } finally {
      setUpdatingPurchaseId(null);
    }
  }

  function openDeleteCreditCardModal(creditCard: CreditCard) {
    setStatusMessage("");
    setStatusType("");
    setCreditCardToDelete(creditCard);
  }

  function openDeletePurchaseModal(purchase: CreditCardPurchase) {
    setStatusMessage("");
    setStatusType("");
    setPurchaseToDelete(purchase);
  }

  async function confirmDeleteCreditCard() {
    if (!creditCardToDelete) {
      return;
    }

    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingCreditCardId(creditCardToDelete.id);

      await deleteCreditCard({
        creditCardId: creditCardToDelete.id,
        financialSpaceId: currentFinancialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Cartão excluído com sucesso!");

      if (editingCreditCardId === creditCardToDelete.id) {
        resetCardForm();
      }

      setCreditCardToDelete(null);

      await loadCreditCardData();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao excluir cartão.",
      );
    } finally {
      setUpdatingCreditCardId(null);
    }
  }

  async function confirmDeletePurchase() {
    if (!purchaseToDelete) {
      return;
    }

    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId) {
      return;
    }

    try {
      setUpdatingPurchaseId(purchaseToDelete.id);

      await deleteCreditCardPurchase({
        purchaseId: purchaseToDelete.id,
        financialSpaceId: currentFinancialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Compra excluída com sucesso!");

      if (editingPurchaseId === purchaseToDelete.id) {
        resetPurchaseForm();
      }

      setPurchaseToDelete(null);

      await loadCreditCardData();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao excluir compra.",
      );
    } finally {
      setUpdatingPurchaseId(null);
    }
  }

  async function handleGenerateStatement() {
    setStatusMessage("");
    setStatusType("");

    const currentFinancialSpaceId = await ensureFinancialSpaceId();

    if (!currentFinancialSpaceId || !selectedCreditCardId) {
      setStatusType("error");
      setStatusMessage("Selecione um cartão para gerar a fatura.");
      return;
    }

    try {
      setIsGeneratingStatement(true);

      const result = await generateCreditCardStatementTransaction({
        financialSpaceId: currentFinancialSpaceId,
        creditCardId: selectedCreditCardId,
        referenceMonth,
      });

      setStatusType("success");

      if (result.totalAmount <= 0) {
        setStatusMessage(
          "Nenhuma compra encontrada para a fatura selecionada.",
        );
      } else if (result.createdCount > 0) {
        setStatusMessage(
          `Fatura gerada com sucesso! ${result.itemCount} compra(s), total de ${formatCurrency(result.totalAmount)}.`,
        );
      } else if (result.updatedCount > 0) {
        setStatusMessage(
          `Fatura atualizada com sucesso! Total de ${formatCurrency(result.totalAmount)}.`,
        );
      } else {
        setStatusMessage(
          "Essa fatura já foi gerada e não foi alterada porque não está mais pendente.",
        );
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao gerar fatura.",
      );
    } finally {
      setIsGeneratingStatement(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <AppSection>
          <AppLoadingState message="Carregando cartões..." />
        </AppSection>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Cartões
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Cartões de crédito
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Cadastre cartões, registre compras e gere o lançamento da fatura para
          o mês.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-blue-700">Cartões ativos</p>
          <strong className="mt-3 block text-3xl font-black text-blue-700">
            {activeCreditCardsCount}
          </strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cartões disponíveis para registrar compras.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-emerald-700">
            Fatura selecionada
          </p>
          <strong className="mt-3 block text-3xl font-black text-emerald-700">
            {formatCurrency(statementTotal)}
          </strong>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Total previsto para o cartão e mês selecionados.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="referenceMonth"
            className="mb-2 block text-sm font-bold text-slate-700"
          >
            Fatura de referência
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
              onClick={() => void handleGenerateStatement()}
              disabled={
                isGeneratingStatement ||
                !selectedCreditCardId ||
                statementTotal <= 0
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {isGeneratingStatement ? "Gerando..." : "Gerar"}
            </button>
          </div>
        </div>
      </section>

      <AppSection
        title={editingCreditCardId ? "Editar cartão" : "Novo cartão"}
        description={
          editingCreditCardId
            ? "Atualize as informações do cartão selecionado."
            : "Cadastre um cartão de crédito com fechamento e vencimento."
        }
      >
        <form onSubmit={handleSubmitCard(onSubmitCard)} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Nome do cartão
              </label>

              <input
                id="name"
                type="text"
                placeholder="Ex: Nubank, Inter, Itaú"
                {...registerCard("name")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {cardErrors.name && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {cardErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Apelido
              </label>

              <input
                id="nickname"
                type="text"
                placeholder="Ex: Cartão principal"
                {...registerCard("nickname")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label
                htmlFor="limitAmount"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Limite
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>

                <Controller
                  control={cardControl}
                  name="limitAmount"
                  render={({ field }) => (
                    <input
                      id="limitAmount"
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

              {cardErrors.limitAmount && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {cardErrors.limitAmount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="closingDay"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Fecha dia
              </label>

              <input
                id="closingDay"
                type="number"
                min={1}
                max={31}
                placeholder="Ex: 25"
                {...registerCard("closingDay")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {cardErrors.closingDay && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {cardErrors.closingDay.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dueDay"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Vence dia
              </label>

              <input
                id="dueDay"
                type="number"
                min={1}
                max={31}
                placeholder="Ex: 10"
                {...registerCard("dueDay")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {cardErrors.dueDay && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {cardErrors.dueDay.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="brand"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Bandeira
              </label>

              <input
                id="brand"
                type="text"
                placeholder="Ex: Mastercard"
                {...registerCard("brand")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="cardNotes"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Observações
            </label>

            <textarea
              id="cardNotes"
              placeholder="Adicione alguma observação, se necessário"
              {...registerCard("notes")}
              className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {editingCreditCardId && (
              <button
                type="button"
                onClick={resetCardForm}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancelar edição
              </button>
            )}

            <AppButton type="submit" disabled={isSubmittingCard}>
              {editingCreditCardId ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              {isSubmittingCard
                ? "Salvando..."
                : editingCreditCardId
                  ? "Salvar alterações"
                  : "Criar cartão"}
            </AppButton>
          </div>

          {statusMessage && statusType && (
            <AppFeedback type={statusType} message={statusMessage} />
          )}
        </form>
      </AppSection>

      <AppSection
        title={editingPurchaseId ? "Editar compra" : "Nova compra no cartão"}
        description={
          editingPurchaseId
            ? "Atualize as informações da compra selecionada."
            : "Cadastre uma compra à vista ou parcelada no cartão de crédito."
        }
      >
        {creditCards.length === 0 ? (
          <AppEmptyState
            variant="dashboard"
            eyebrow="Cartões"
            title="Cadastre um cartão primeiro"
            description="Antes de cadastrar compras, crie ao menos um cartão de crédito."
          />
        ) : (
          <form
            onSubmit={handleSubmitPurchase(onSubmitPurchase)}
            className="grid gap-5"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="creditCardId"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Cartão
                </label>

                <select
                  id="creditCardId"
                  {...registerPurchase("creditCardId")}
                  onChange={(event) => {
                    setSelectedCreditCardId(event.target.value);
                    setPurchaseValue("creditCardId", event.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Selecione um cartão</option>

                  {creditCards.map((creditCard) => (
                    <option key={creditCard.id} value={creditCard.id}>
                      {getCreditCardDisplayName(creditCard)}
                    </option>
                  ))}
                </select>

                {purchaseErrors.creditCardId && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {purchaseErrors.creditCardId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="purchaseDescription"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Descrição
                </label>

                <input
                  id="purchaseDescription"
                  type="text"
                  placeholder="Ex: Mercado, celular, assinatura"
                  {...registerPurchase("description")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                {purchaseErrors.description && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {purchaseErrors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label
                  htmlFor="totalAmount"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Valor total
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-slate-400">
                    R$
                  </span>

                  <Controller
                    control={purchaseControl}
                    name="totalAmount"
                    render={({ field }) => (
                      <input
                        id="totalAmount"
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

                {purchaseErrors.totalAmount && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {purchaseErrors.totalAmount.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="purchaseDate"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Data da compra
                </label>

                <input
                  id="purchaseDate"
                  type="date"
                  {...registerPurchase("purchaseDate")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                {purchaseErrors.purchaseDate && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {purchaseErrors.purchaseDate.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="installmentsTotal"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Parcelas
                </label>

                <input
                  id="installmentsTotal"
                  type="number"
                  min={1}
                  placeholder="Ex: 1"
                  {...registerPurchase("installmentsTotal")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                {purchaseErrors.installmentsTotal && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {purchaseErrors.installmentsTotal.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="firstInstallmentNumber"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Parcela inicial
                </label>

                <input
                  id="firstInstallmentNumber"
                  type="number"
                  min={1}
                  placeholder="Ex: 1"
                  {...registerPurchase("firstInstallmentNumber")}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                {purchaseErrors.firstInstallmentNumber && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {purchaseErrors.firstInstallmentNumber.message}
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
                {...registerPurchase("categoryId")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Sem categoria</option>

                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="purchaseNotes"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Observações
              </label>

              <textarea
                id="purchaseNotes"
                placeholder="Adicione alguma observação, se necessário"
                {...registerPurchase("notes")}
                className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {editingPurchaseId && (
                <button
                  type="button"
                  onClick={resetPurchaseForm}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Cancelar edição
                </button>
              )}

              <AppButton type="submit" disabled={isSubmittingPurchase}>
                {editingPurchaseId ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {isSubmittingPurchase
                  ? "Salvando..."
                  : editingPurchaseId
                    ? "Salvar alterações"
                    : "Cadastrar compra"}
              </AppButton>
            </div>
          </form>
        )}
      </AppSection>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AppSection
          title="Fatura do mês"
          description="Veja as compras que entram na fatura selecionada antes de gerar o lançamento."
        >
          {selectedCreditCard ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="selectedCreditCard"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Cartão selecionado
                </label>

                <select
                  id="selectedCreditCard"
                  value={selectedCreditCardId}
                  onChange={(event) =>
                    setSelectedCreditCardId(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {creditCards.map((creditCard) => (
                    <option key={creditCard.id} value={creditCard.id}>
                      {getCreditCardDisplayName(creditCard)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-bold text-blue-700">
                  {getCreditCardDisplayName(selectedCreditCard)}
                </p>

                <strong className="mt-2 block text-3xl font-black text-blue-700">
                  {formatCurrency(statementTotal)}
                </strong>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Vencimento previsto:{" "}
                  <strong>{formatDate(statementDueDate)}</strong>
                </p>

                {availableLimit !== null && (
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Limite disponível após essa fatura:{" "}
                    <strong>{formatCurrency(availableLimit)}</strong>
                  </p>
                )}
              </div>

              {statementItems.length === 0 ? (
                <AppEmptyState
                  variant="dashboard"
                  eyebrow="Fatura"
                  title="Nenhuma compra nesta fatura"
                  description="Cadastre compras no cartão ou selecione outro mês para visualizar a fatura."
                />
              ) : (
                <div className="space-y-3">
                  {statementItems.map((item) => (
                    <div
                      key={`${item.purchase.id}-${item.installmentNumber}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950">
                            {item.purchase.description}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Compra: {formatDate(item.purchase.purchase_date)} •{" "}
                            Parcela {item.installmentNumber}/
                            {item.installmentsTotal}
                          </p>
                        </div>

                        <strong className="text-sm font-black text-blue-700">
                          {formatCurrency(item.installmentAmount)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <AppEmptyState
              variant="dashboard"
              eyebrow="Cartões"
              title="Nenhum cartão selecionado"
              description="Cadastre um cartão para visualizar a fatura."
            />
          )}
        </AppSection>

        <AppSection
          title="Lista de cartões"
          description={`${creditCards.length} cartão(ões) cadastrado(s).`}
        >
          {creditCards.length === 0 ? (
            <AppEmptyState
              variant="dashboard"
              eyebrow="Cartões"
              title="Nenhum cartão cadastrado"
              description="Cadastre seus cartões para começar a controlar compras e faturas."
            />
          ) : (
            <div className="space-y-3">
              {creditCards.map((creditCard) => {
                const isUpdating = updatingCreditCardId === creditCard.id;

                return (
                  <div
                    key={creditCard.id}
                    className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_auto] xl:items-center">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            creditCard.active
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <CreditCardIcon className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-950">
                              {getCreditCardDisplayName(creditCard)}
                            </p>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-black ${
                                creditCard.active
                                  ? "border-blue-100 bg-blue-50 text-blue-700"
                                  : "border-slate-200 bg-slate-100 text-slate-500"
                              }`}
                            >
                              {creditCard.active ? "Ativo" : "Inativo"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {creditCard.name}
                            {creditCard.brand ? ` • ${creditCard.brand}` : ""}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                          Limite
                        </p>
                        <p className="mt-1 text-sm font-black text-blue-700">
                          {creditCard.limit_amount !== null
                            ? formatCurrency(Number(creditCard.limit_amount))
                            : "Não informado"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                          Fechamento
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-700">
                          Fecha dia {creditCard.closing_day} • Vence dia{" "}
                          {creditCard.due_day}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 xl:justify-end">
                        <button
                          type="button"
                          title="Editar cartão"
                          aria-label="Editar cartão"
                          onClick={() => startEditingCreditCard(creditCard)}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <SquarePen className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          title="Excluir cartão"
                          aria-label="Excluir cartão"
                          onClick={() => openDeleteCreditCardModal(creditCard)}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          title={
                            creditCard.active
                              ? "Desativar cartão"
                              : "Reativar cartão"
                          }
                          aria-label={
                            creditCard.active
                              ? "Desativar cartão"
                              : "Reativar cartão"
                          }
                          onClick={() =>
                            void handleToggleCreditCardStatus(creditCard)
                          }
                          disabled={isUpdating}
                          className={`inline-flex items-center justify-center rounded-2xl p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                            creditCard.active
                              ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                          }`}
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : creditCard.active ? (
                            <Ban className="h-5 w-5" />
                          ) : (
                            <RotateCcw className="h-5 w-5" />
                          )}
                        </button>

                        {editingCreditCardId === creditCard.id && (
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
      </section>

      <AppSection
        title="Compras no cartão"
        description={`${purchases.length} compra(s) cadastrada(s).`}
      >
        {purchases.length === 0 ? (
          <AppEmptyState
            variant="transactions"
            eyebrow="Compras"
            title="Nenhuma compra cadastrada"
            description="Cadastre compras no cartão para montar as faturas mensais."
          />
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => {
              const creditCard = creditCards.find(
                (currentCreditCard) =>
                  currentCreditCard.id === purchase.credit_card_id,
              );
              const category = categories.find(
                (currentCategory) =>
                  currentCategory.id === purchase.category_id,
              );
              const isUpdating = updatingPurchaseId === purchase.id;

              return (
                <div
                  key={purchase.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto] xl:items-center">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          purchase.status === "active"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-slate-950">
                            {purchase.description}
                          </p>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${
                              purchase.status === "active"
                                ? "border-blue-100 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-slate-100 text-slate-500"
                            }`}
                          >
                            {purchaseStatusLabels[purchase.status]}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {creditCard
                            ? getCreditCardDisplayName(creditCard)
                            : "Cartão não encontrado"}
                          {" • "}
                          {category?.name ?? "Sem categoria"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Valor
                      </p>
                      <p className="mt-1 text-sm font-black text-blue-700">
                        {formatCurrency(Number(purchase.total_amount))}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Compra
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-700">
                        {formatDate(purchase.purchase_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                        Parcelas
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-700">
                        {purchase.installments_total === 1
                          ? "À vista"
                          : `${purchase.installments_total}x`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 xl:justify-end">
                      <button
                        type="button"
                        title="Editar compra"
                        aria-label="Editar compra"
                        onClick={() => startEditingPurchase(purchase)}
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <SquarePen className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        title="Excluir compra"
                        aria-label="Excluir compra"
                        onClick={() => openDeletePurchaseModal(purchase)}
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        title={
                          purchase.status === "active"
                            ? "Cancelar compra"
                            : "Reativar compra"
                        }
                        aria-label={
                          purchase.status === "active"
                            ? "Cancelar compra"
                            : "Reativar compra"
                        }
                        onClick={() =>
                          void handleTogglePurchaseStatus(purchase)
                        }
                        disabled={isUpdating}
                        className={`inline-flex items-center justify-center rounded-2xl p-2 transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                          purchase.status === "active"
                            ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        }`}
                      >
                        {isUpdating ? (
                          <span className="text-xs">...</span>
                        ) : purchase.status === "active" ? (
                          <Ban className="h-5 w-5" />
                        ) : (
                          <RotateCcw className="h-5 w-5" />
                        )}
                      </button>

                      {editingPurchaseId === purchase.id && (
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

      {creditCardToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-credit-card-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <div>
                <h2
                  id="delete-credit-card-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  Excluir cartão?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está prestes a excluir{" "}
                  <strong className="font-black text-slate-950">
                    {getCreditCardDisplayName(creditCardToDelete)}
                  </strong>
                  . Essa ação remove o cartão e compras vinculadas a ele.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">
                Use essa opção apenas para cartões cadastrados por engano.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCreditCardToDelete(null)}
                disabled={updatingCreditCardId === creditCardToDelete.id}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void confirmDeleteCreditCard()}
                disabled={updatingCreditCardId === creditCardToDelete.id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {updatingCreditCardId === creditCardToDelete.id
                  ? "Excluindo..."
                  : "Excluir cartão"}
              </button>
            </div>
          </div>
        </div>
      )}

      {purchaseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-purchase-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <div>
                <h2
                  id="delete-purchase-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  Excluir compra?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está prestes a excluir{" "}
                  <strong className="font-black text-slate-950">
                    {purchaseToDelete.description}
                  </strong>
                  . Essa ação remove a compra das faturas do cartão.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">
                Use essa opção apenas para compras cadastradas por engano.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPurchaseToDelete(null)}
                disabled={updatingPurchaseId === purchaseToDelete.id}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void confirmDeletePurchase()}
                disabled={updatingPurchaseId === purchaseToDelete.id}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {updatingPurchaseId === purchaseToDelete.id
                  ? "Excluindo..."
                  : "Excluir compra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
