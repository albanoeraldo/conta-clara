"use client";

import { useCallback, useEffect, useState } from "react";

import { AppButton, AppLinkButton } from "@/components/ui/app-button";
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
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    const matchesMonth = transaction.due_date.startsWith(monthFilter);

    return matchesType && matchesStatus && matchesMonth;
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

      const userTransactions = await getTransactions(currentFinancialSpaceId);

      setFinancialSpaceId(currentFinancialSpaceId);
      setTransactions(userTransactions);
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
        <div className="grid gap-4 md:grid-cols-3">
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

      {statusMessage && (
        <section
          className={`mb-6 rounded-2xl px-4 py-3 text-center text-sm ${
            statusType === "success"
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-red-400/10 text-red-300"
          }`}
        >
          {statusMessage}
        </section>
      )}

      {isLoading && (
        <AppSection>
          <p className="text-center text-sm text-zinc-400">
            Carregando lançamentos...
          </p>
        </AppSection>
      )}

      {!isLoading && errorMessage && (
        <section className="rounded-3xl bg-red-400/10 p-6 text-center text-sm text-red-300">
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && filteredTransactions.length === 0 && (
        <AppSection>
          <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
            <h2 className="text-xl font-semibold">
              Nenhum lançamento encontrado
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Ajuste os filtros ou cadastre uma nova receita ou despesa.
            </p>

            <AppLinkButton href="/lancamentos/novo" className="mt-6">
              Cadastrar lançamento
            </AppLinkButton>
          </div>
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
                  className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-center"
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

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <strong
                      className={`text-lg ${
                        isIncome ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {isIncome ? "+" : "-"}{" "}
                      {formatCurrency(Number(transaction.amount))}
                    </strong>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <AppLinkButton
                        href={`/lancamentos/${transaction.id}/editar`}
                        variant="secondary"
                        size="sm"
                      >
                        Editar
                      </AppLinkButton>

                      {transaction.status !== "cancelled" && (
                        <AppButton
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            void handleCancelTransaction(transaction.id)
                          }
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Atualizando..." : "Cancelar"}
                        </AppButton>
                      )}

                      {isPending && (
                        <AppButton
                          type="button"
                          size="sm"
                          onClick={() => void handleMarkAsPaid(transaction.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Atualizando..." : "Marcar como pago"}
                        </AppButton>
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
