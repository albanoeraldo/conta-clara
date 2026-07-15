"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Ban,
  BriefcaseBusiness,
  Car,
  CircleCheck,
  CircleDollarSign,
  Clapperboard,
  CreditCard,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Lightbulb,
  PawPrint,
  PiggyBank,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  ShoppingCart,
  Smartphone,
  SquarePen,
  Trash2,
  Utensils,
  Wifi,
} from "lucide-react";

import { AppEmptyState } from "@/components/ui/app-empty-state";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLinkButton } from "@/components/ui/app-button";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppSection } from "@/components/ui/app-section";
import {
  getCurrentMonthValue,
  useReferenceMonth,
} from "@/hooks/use-reference-month";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveCategories, type Category } from "@/services/categories";
import { isReferenceMonthClosed } from "@/services/monthly-closings";
import {
  cancelTransaction,
  deleteTransaction,
  getTransactions,
  markTransactionAsPaid,
  markTransactionAsPending,
  type Transaction,
} from "@/services/transactions";

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

const typeLabels: Record<Transaction["type"], string> = {
  income: "Receita",
  expense: "Despesa",
};

const statusLabels: Record<Transaction["status"], string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

const paymentMethodLabels: Record<Transaction["payment_method"], string> = {
  pix: "Pix",
  money: "Dinheiro",
  debit: "Débito",
  credit_card: "Cartão de crédito",
  bank_transfer: "Transferência bancária",
  boleto: "Boleto",
  other: "Outro",
};

function normalizeCategoryName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCategoryIcon(
  category: Category | undefined,
  transactionType: Transaction["type"],
): LucideIcon {
  if (!category) {
    return transactionType === "income" ? CircleDollarSign : Receipt;
  }

  const name = normalizeCategoryName(category.name);

  if (category.type === "income") {
    if (
      name.includes("salario") ||
      name.includes("comissao") ||
      name.includes("trabalho")
    ) {
      return BriefcaseBusiness;
    }

    if (
      name.includes("invest") ||
      name.includes("rendimento") ||
      name.includes("dividendo")
    ) {
      return PiggyBank;
    }

    return CircleDollarSign;
  }

  if (
    name.includes("mercado") ||
    name.includes("supermercado") ||
    name.includes("compras")
  ) {
    return ShoppingCart;
  }

  if (
    name.includes("alimentacao") ||
    name.includes("restaurante") ||
    name.includes("ifood") ||
    name.includes("lanche")
  ) {
    return Utensils;
  }

  if (
    name.includes("casa") ||
    name.includes("aluguel") ||
    name.includes("condominio")
  ) {
    return Home;
  }

  if (
    name.includes("internet") ||
    name.includes("wifi") ||
    name.includes("telefone")
  ) {
    return Wifi;
  }

  if (name.includes("celular")) {
    return Smartphone;
  }

  if (name.includes("energia") || name.includes("luz")) {
    return Lightbulb;
  }

  if (
    name.includes("transporte") ||
    name.includes("combustivel") ||
    name.includes("uber") ||
    name.includes("carro")
  ) {
    return Car;
  }

  if (name.includes("cartao") || name.includes("credito")) {
    return CreditCard;
  }

  if (name.includes("pet") || name.includes("animal")) {
    return PawPrint;
  }

  if (
    name.includes("saude") ||
    name.includes("farmacia") ||
    name.includes("medico")
  ) {
    return HeartPulse;
  }

  if (
    name.includes("curso") ||
    name.includes("faculdade") ||
    name.includes("estudo")
  ) {
    return GraduationCap;
  }

  if (
    name.includes("lazer") ||
    name.includes("netflix") ||
    name.includes("streaming")
  ) {
    return Clapperboard;
  }

  if (name.includes("presente")) {
    return Gift;
  }

  if (
    name.includes("banco") ||
    name.includes("taxa") ||
    name.includes("tarifa")
  ) {
    return Landmark;
  }

  return Receipt;
}

const statusBadgeClasses: Record<Transaction["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
  paid: "bg-blue-50 text-blue-700 border-blue-100",
  overdue: "bg-red-50 text-red-600 border-red-100",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function LancamentosPage() {
  const {
    referenceMonth,
    setReferenceMonth,
    resetReferenceMonth,
    referenceMonthLabel,
  } = useReferenceMonth();

  const currentMonthValue = getCurrentMonthValue();

  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [transactionToCancel, setTransactionToCancel] =
    useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "paid" | "overdue" | "cancelled"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTransactionId, setUpdatingTransactionId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [isSelectedMonthClosed, setIsSelectedMonthClosed] = useState(false);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    referenceMonth !== currentMonthValue;

  const filteredTransactions = transactions.filter((transaction) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      transaction.description.toLowerCase().includes(normalizedSearchTerm);

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    const matchesMonth = transaction.due_date.startsWith(referenceMonth);

    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "uncategorized" && !transaction.category_id) ||
      transaction.category_id === categoryFilter;

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus &&
      matchesMonth &&
      matchesCategory
    );
  });

  function showClosedMonthMessage() {
    setStatusType("error");
    setStatusMessage(
      `Este mês está fechado. Para fazer alterações em ${referenceMonthLabel}, reabra o mês na tela de relatórios.`,
    );
  }

  const loadTransactions = useCallback(async () => {
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

      const [userTransactions, activeCategories, selectedMonthClosed] =
        await Promise.all([
          getTransactions(currentFinancialSpaceId),
          getActiveCategories(currentFinancialSpaceId),
          isReferenceMonthClosed(currentFinancialSpaceId, referenceMonth),
        ]);

      setFinancialSpaceId(currentFinancialSpaceId);
      setTransactions(userTransactions);
      setCategories(activeCategories);
      setIsSelectedMonthClosed(selectedMonthClosed);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar lançamentos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [referenceMonth]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTransactions]);

  async function handleMarkAsPaid(transactionId: string) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      setUpdatingTransactionId(transactionId);

      await markTransactionAsPaid({
        transactionId,
        financialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Lançamento marcado como pago.");

      await loadTransactions();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao marcar lançamento como pago.",
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  async function handleMarkAsPending(transactionId: string) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      setUpdatingTransactionId(transactionId);

      await markTransactionAsPending({
        transactionId,
        financialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Lançamento marcado como pendente.");

      await loadTransactions();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao marcar lançamento como pendente.",
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  function openCancelTransactionModal(transaction: Transaction) {
    setStatusMessage("");
    setStatusType("");

    if (isSelectedMonthClosed) {
      showClosedMonthMessage();
      return;
    }

    setTransactionToCancel(transaction);
  }

  async function handleCancelTransaction(transactionId: string) {
    setStatusMessage("");
    setStatusType("");

    if (isSelectedMonthClosed) {
      showClosedMonthMessage();
      return;
    }

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      setUpdatingTransactionId(transactionId);

      await cancelTransaction({
        transactionId,
        financialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Lançamento cancelado com sucesso.");

      setTransactionToCancel(null);

      await loadTransactions();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao cancelar lançamento.",
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  function openDeleteTransactionModal(transaction: Transaction) {
    setStatusMessage("");
    setStatusType("");

    if (isSelectedMonthClosed) {
      showClosedMonthMessage();
      return;
    }

    setTransactionToDelete(transaction);
  }

  async function confirmDeleteTransaction() {
    if (!transactionToDelete) {
      return;
    }

    if (isSelectedMonthClosed) {
      setTransactionToDelete(null);
      showClosedMonthMessage();
      return;
    }

    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      setUpdatingTransactionId(transactionToDelete.id);

      await deleteTransaction({
        transactionId: transactionToDelete.id,
        financialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Lançamento excluído com sucesso!");

      setTransactionToDelete(null);

      await loadTransactions();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao excluir lançamento.",
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  return (
    <main className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            Lançamentos
          </p>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Meus lançamentos
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Visualize, filtre e gerencie suas receitas e despesas de{" "}
            <strong className="font-black text-slate-700">
              {referenceMonthLabel}
            </strong>
            .
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center lg:justify-end">
          <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            <label htmlFor="transactionsReferenceMonth" className="sr-only">
              Mês de referência
            </label>

            <input
              id="transactionsReferenceMonth"
              type="month"
              value={referenceMonth}
              onChange={(event) => setReferenceMonth(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-auto"
            />
          </div>

          <button
            type="button"
            onClick={resetReferenceMonth}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
          >
            Atual
          </button>

          {isSelectedMonthClosed ? (
            <button
              type="button"
              onClick={showClosedMonthMessage}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-200 px-5 py-3 text-sm font-black text-slate-500"
            >
              <Plus className="h-4 w-4" />
              Mês fechado
            </button>
          ) : (
            <AppLinkButton href="/lancamentos/novo">
              <Plus className="h-4 w-4" />
              Novo lançamento
            </AppLinkButton>
          )}
        </div>
      </div>

      <AppSection
        title="Filtros"
        description="Refine a visualização dos lançamentos por busca, tipo, categoria, status e mês."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <label
              htmlFor="searchTerm"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Buscar
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="searchTerm"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por descrição"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="typeFilter"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Tipo
            </label>

            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as "all" | "income" | "expense",
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="categoryFilter"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Categoria
            </label>

            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Todas</option>
              <option value="uncategorized">Sem categoria</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="statusFilter"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Status
            </label>

            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | "pending"
                    | "paid"
                    | "overdue"
                    | "cancelled",
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos</option>
              <option value="overdue">Atrasados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="monthFilter"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Mês
            </label>

            <div className="grid gap-2 sm:flex">
              <input
                id="monthFilter"
                type="month"
                value={referenceMonth}
                onChange={(event) => setReferenceMonth(event.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={resetReferenceMonth}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
              >
                Atual
              </button>
            </div>
          </div>
        </div>
      </AppSection>

      {statusMessage && statusType && (
        <AppFeedback
          type={statusType}
          message={statusMessage}
          className="mb-6"
        />
      )}

      {isSelectedMonthClosed && (
        <AppFeedback
          type="error"
          message={`Este mês está fechado. Você ainda pode marcar lançamentos pendentes como pagos, mas para criar, editar, excluir ou cancelar lançamentos em ${referenceMonthLabel}, reabra o mês na tela de relatórios.`}
          className="mb-6"
        />
      )}

      {isLoading && (
        <AppSection>
          <AppLoadingState message="Carregando lançamentos..." />
        </AppSection>
      )}

      {!isLoading && errorMessage && (
        <AppFeedback type="error" message={errorMessage} />
      )}

      {!isLoading && !errorMessage && filteredTransactions.length === 0 && (
        <AppSection>
          <AppEmptyState
            variant={hasActiveFilters ? "search" : "transactions"}
            title={
              hasActiveFilters
                ? "Nenhum lançamento encontrado"
                : "Nenhum lançamento cadastrado neste mês"
            }
            description={
              hasActiveFilters
                ? "Ajuste a busca ou os filtros aplicados para encontrar o lançamento que você procura."
                : "Cadastre uma receita ou despesa para este mês e acompanhe tudo com mais clareza."
            }
            action={
              isSelectedMonthClosed ? (
                <button
                  type="button"
                  onClick={showClosedMonthMessage}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-200 px-4 py-2 text-sm font-black text-slate-500"
                >
                  Mês fechado
                </button>
              ) : (
                <AppLinkButton href="/lancamentos/novo" size="sm">
                  Cadastrar lançamento
                </AppLinkButton>
              )
            }
          />
        </AppSection>
      )}

      {!isLoading && !errorMessage && filteredTransactions.length > 0 && (
        <AppSection
          title="Lista de lançamentos"
          description={`${filteredTransactions.length} lançamento(s) encontrado(s) em ${referenceMonthLabel}.`}
        >
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const isPending = transaction.status === "pending";
              const isPaid = transaction.status === "paid";
              const isUpdating = updatingTransactionId === transaction.id;
              const category = categories.find(
                (currentCategory) =>
                  currentCategory.id === transaction.category_id,
              );
              const Icon = getCategoryIcon(category, transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md sm:p-5 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto] xl:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isIncome
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-black wrap-break-word text-slate-950">
                        {transaction.description}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Vencimento: {formatDate(transaction.due_date)}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {category?.name ?? "Sem categoria"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                      Tipo
                    </p>

                    <p
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                        isIncome
                          ? "border-blue-100 bg-blue-50 text-blue-700"
                          : "border-red-100 bg-red-50 text-red-600"
                      }`}
                    >
                      {typeLabels[transaction.type]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                      Status
                    </p>

                    <p
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                        statusBadgeClasses[transaction.status]
                      }`}
                    >
                      {statusLabels[transaction.status]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                      Pagamento
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      {paymentMethodLabels[transaction.payment_method]}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:col-span-2 xl:col-span-1 xl:items-end">
                    <strong
                      className={`text-lg font-black ${
                        isIncome ? "text-blue-700" : "text-red-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {formatCurrency(Number(transaction.amount))}
                    </strong>

                    <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-3 xl:justify-end">
                      {isSelectedMonthClosed ? (
                        <button
                          type="button"
                          title="Mês fechado"
                          aria-label="Mês fechado"
                          onClick={showClosedMonthMessage}
                          className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-100 p-2 text-slate-400 sm:w-auto"
                        >
                          <SquarePen className="h-5 w-5" />
                          <span className="sr-only">Mês fechado</span>
                        </button>
                      ) : (
                        <Link
                          href={`/lancamentos/${transaction.id}/editar`}
                          title="Editar"
                          aria-label="Editar lançamento"
                          className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
                        >
                          <SquarePen className="h-5 w-5" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        title="Excluir lançamento"
                        aria-label="Excluir lançamento"
                        onClick={() => openDeleteTransactionModal(transaction)}
                        disabled={isUpdating || isSelectedMonthClosed}
                        className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Excluir</span>
                      </button>

                      {transaction.status !== "cancelled" && (
                        <button
                          type="button"
                          title="Cancelar"
                          aria-label="Cancelar lançamento"
                          onClick={() =>
                            openCancelTransactionModal(transaction)
                          }
                          disabled={isUpdating || isSelectedMonthClosed}
                          className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-red-50 p-2 text-red-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <Ban className="h-5 w-5" />
                              <span className="sr-only">Cancelar</span>
                            </>
                          )}
                        </button>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          title="Marcar como pago"
                          aria-label="Marcar lançamento como pago"
                          onClick={() => void handleMarkAsPaid(transaction.id)}
                          disabled={isUpdating}
                          className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <CircleCheck className="h-5 w-5" />
                              <span className="sr-only">Marcar como pago</span>
                            </>
                          )}
                        </button>
                      )}
                      {isPaid && (
                        <button
                          type="button"
                          title="Marcar como pendente"
                          aria-label="Marcar lançamento como pendente"
                          onClick={() =>
                            void handleMarkAsPending(transaction.id)
                          }
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center rounded-2xl bg-yellow-50 p-2 text-yellow-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-yellow-100 hover:text-yellow-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <RotateCcw className="h-5 w-5" />
                              <span className="sr-only">
                                Marcar como pendente
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AppSection>
      )}

      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-transaction-title"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>

              <div>
                <h2
                  id="delete-transaction-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  Excluir lançamento?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está prestes a excluir{" "}
                  <strong className="font-black text-slate-950">
                    {transactionToDelete.description}
                  </strong>
                  . Essa ação remove o lançamento da lista, do dashboard e dos
                  cálculos do mês.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">
                Use essa opção apenas para lançamentos cadastrados por engano.
                Para manter histórico, prefira cancelar.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                disabled={updatingTransactionId === transactionToDelete.id}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void confirmDeleteTransaction()}
                disabled={updatingTransactionId === transactionToDelete.id}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {updatingTransactionId === transactionToDelete.id
                  ? "Excluindo..."
                  : "Excluir lançamento"}
              </button>
            </div>
          </div>
        </div>
      )}
      {transactionToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-transaction-title"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Ban className="h-6 w-6" />
              </div>

              <div>
                <h2
                  id="cancel-transaction-title"
                  className="text-xl font-black tracking-tight text-slate-950"
                >
                  Cancelar lançamento?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Você está prestes a cancelar{" "}
                  <strong className="font-black text-slate-950">
                    {transactionToCancel.description}
                  </strong>
                  . O lançamento continuará no histórico, mas não será
                  considerado nos totais do mês.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-600">
                Use essa opção quando quiser manter o registro sem apagar a
                informação.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setTransactionToCancel(null)}
                disabled={updatingTransactionId === transactionToCancel.id}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleCancelTransaction(transactionToCancel.id)
                }
                disabled={updatingTransactionId === transactionToCancel.id}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Ban className="h-4 w-4" />
                {updatingTransactionId === transactionToCancel.id
                  ? "Cancelando..."
                  : "Cancelar lançamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
