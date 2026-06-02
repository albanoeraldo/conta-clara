"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Ban, CircleCheck, Search, SquarePen } from "lucide-react";

import { getActiveCategories, type Category } from "@/services/categories";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppLinkButton } from "@/components/ui/app-button";
import { AppSection } from "@/components/ui/app-section";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import {
  cancelTransaction,
  getTransactions,
  markTransactionAsPaid,
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

function getCurrentMonthValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
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

export default function LancamentosPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "paid" | "overdue" | "cancelled"
  >("all");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthValue());
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTransactionId, setUpdatingTransactionId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const filteredTransactions = transactions.filter((transaction) => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      transaction.description.toLowerCase().includes(normalizedSearchTerm);

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    const matchesMonth = transaction.due_date.startsWith(monthFilter);

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

      const [userTransactions, activeCategories] = await Promise.all([
        getTransactions(currentFinancialSpaceId),
        getActiveCategories(currentFinancialSpaceId),
      ]);

      setFinancialSpaceId(currentFinancialSpaceId);
      setTransactions(userTransactions);
      setCategories(activeCategories);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar lançamentos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  async function handleCancelTransaction(transactionId: string) {
    const confirmCancel = window.confirm(
      "Tem certeza que deseja cancelar este lançamento?",
    );

    if (!confirmCancel) {
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
      setUpdatingTransactionId(transactionId);

      await cancelTransaction({
        transactionId,
        financialSpaceId,
      });

      setStatusType("success");
      setStatusMessage("Lançamento cancelado com sucesso.");

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

  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Lançamentos
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Meus lançamentos
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Visualize e gerencie suas receitas e despesas cadastradas.
          </p>
        </div>

        <AppLinkButton href="/lancamentos/novo">Novo lançamento</AppLinkButton>
      </div>

      <AppSection
        title="Filtros"
        description="Refine a visualização dos lançamentos por tipo, status e mês."
        className="mb-6"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label
              htmlFor="searchTerm"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Buscar
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <input
                id="searchTerm"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por descrição"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pr-4 pl-11 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-blue-400"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="typeFilter"
              className="mb-2 block text-sm font-medium text-zinc-200"
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            >
              <option value="all">Todos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="categoryFilter"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Categoria
            </label>

            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-blue-400"
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
              className="mb-2 block text-sm font-medium text-zinc-200"
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
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
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Mês
            </label>

            <input
              id="monthFilter"
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            />
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
            variant={
              searchTerm ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
                ? "search"
                : "transactions"
            }
            title={
              searchTerm ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
                ? "Nenhum lançamento encontrado"
                : "Nenhum lançamento cadastrado ainda"
            }
            description={
              searchTerm ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              categoryFilter !== "all"
                ? "Ajuste a busca ou os filtros aplicados para encontrar o lançamento que você procura."
                : "Cadastre sua primeira receita ou despesa para começar a acompanhar seu mês com mais clareza."
            }
            action={
              <AppLinkButton href="/lancamentos/novo" size="sm">
                Cadastrar lançamento
              </AppLinkButton>
            }
          />
        </AppSection>
      )}

      {!isLoading && !errorMessage && filteredTransactions.length > 0 && (
        <AppSection
          title="Lista de lançamentos"
          description={`${filteredTransactions.length} lançamento(s) encontrado(s).`}
        >
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const isPending = transaction.status === "pending";
              const isUpdating = updatingTransactionId === transaction.id;

              return (
                <div
                  key={transaction.id}
                  className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto] xl:items-center"
                >
                  <div>
                    <p className="font-medium text-white">
                      {transaction.description}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Vencimento: {formatDate(transaction.due_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
                      Tipo
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        isIncome ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {typeLabels[transaction.type]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-300">
                      {statusLabels[transaction.status]}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
                      Pagamento
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-300">
                      {paymentMethodLabels[transaction.payment_method]}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:col-span-2 xl:col-span-1 xl:items-end">
                    <strong
                      className={`text-lg ${
                        isIncome ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {formatCurrency(Number(transaction.amount))}
                    </strong>

                    <div className="flex w-full items-center gap-4 xl:justify-end">
                      <Link
                        href={`/lancamentos/${transaction.id}/editar`}
                        title="Editar"
                        aria-label="Editar lançamento"
                        className="inline-flex cursor-pointer items-center justify-center p-1.5 text-zinc-400 transition hover:text-white"
                      >
                        <SquarePen className="h-6 w-6" />
                        <span className="sr-only">Editar</span>
                      </Link>

                      {transaction.status !== "cancelled" && (
                        <button
                          type="button"
                          title="Cancelar"
                          aria-label="Cancelar lançamento"
                          onClick={() =>
                            void handleCancelTransaction(transaction.id)
                          }
                          disabled={isUpdating}
                          className="inline-flex cursor-pointer items-center justify-center p-1.5 text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <Ban className="h-6 w-6" />
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
                          className="inline-flex cursor-pointer items-center justify-center p-1.5 text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <>
                              <CircleCheck className="h-6 w-6" />
                              <span className="sr-only">Marcar como pago</span>
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
    </main>
  );
}
