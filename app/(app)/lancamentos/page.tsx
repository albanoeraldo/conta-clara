"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { getTransactions, type Transaction } from "@/services/transactions";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "paid" | "overdue" | "cancelled"
  >("all");
  const [monthFilter, setMonthFilter] = useState(getCurrentMonthValue());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    const matchesMonth = transaction.due_date.startsWith(monthFilter);

    return matchesType && matchesStatus && matchesMonth;
  });

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          return;
        }

        const financialSpaceId = await getUserFinancialSpaceId(user.id);

        if (!financialSpaceId) {
          return;
        }

        const userTransactions = await getTransactions(financialSpaceId);

        if (!isMounted) {
          return;
        }

        setTransactions(userTransactions);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar lançamentos.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

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

        <Link
          href="/lancamentos/novo"
          className="rounded-xl bg-emerald-400 px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
        >
          Novo lançamento
        </Link>
      </div>

      <section className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
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
      </section>

      {isLoading && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-xl">
          <p className="text-sm text-zinc-400">Carregando lançamentos...</p>
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className="rounded-3xl bg-red-400/10 p-6 text-center text-sm text-red-300">
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && filteredTransactions.length === 0 && (
        <section className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/70 p-8 text-center shadow-xl">
          <h2 className="text-xl font-semibold">
            Nenhum lançamento encontrado
          </h2>

          <p className="mt-3 text-sm text-zinc-400">
            Ajuste os filtros ou cadastre uma nova receita ou despesa.
          </p>

          <Link
            href="/lancamentos/novo"
            className="mt-6 inline-flex rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Cadastrar lançamento
          </Link>
        </section>
      )}

      {!isLoading && !errorMessage && filteredTransactions.length > 0 && (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Lista de lançamentos</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {filteredTransactions.length} lançamento(s) encontrado(s).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";

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

                  <strong
                    className={`text-lg ${
                      isIncome ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {isIncome ? "+" : "-"}{" "}
                    {formatCurrency(Number(transaction.amount))}
                  </strong>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
