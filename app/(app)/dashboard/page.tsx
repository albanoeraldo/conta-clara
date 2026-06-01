"use client";

import { useEffect, useState } from "react";

import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { AppLinkButton } from "@/components/ui/app-button";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { AppSection } from "@/components/ui/app-section";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getCurrentMonthTransactions,
  getLatestTransactions,
  getUpcomingPendingTransactions,
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

function getCurrentMonthLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function calculateMonthlySummary(transactions: Transaction[]) {
  const activeTransactions = transactions.filter(
    (transaction) => transaction.status !== "cancelled",
  );

  const incomeTotal = activeTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenseTotal = activeTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const pendingCount = activeTransactions.filter(
    (transaction) => transaction.status === "pending",
  ).length;

  return {
    incomeTotal,
    expenseTotal,
    predictedBalance: incomeTotal - expenseTotal,
    pendingCount,
  };
}

const statusLabels: Record<Transaction["status"], string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export default function DashboardPage() {
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>(
    [],
  );
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>(
    [],
  );
  const [upcomingPendingTransactions, setUpcomingPendingTransactions] =
    useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const monthlySummary = calculateMonthlySummary(monthlyTransactions);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          return;
        }

        const financialSpaceId = await getUserFinancialSpaceId(user.id);

        if (!financialSpaceId) {
          return;
        }

        const [latest, currentMonth, upcomingPending] = await Promise.all([
          getLatestTransactions(financialSpaceId),
          getCurrentMonthTransactions(financialSpaceId),
          getUpcomingPendingTransactions(financialSpaceId),
        ]);

        if (!isMounted) {
          return;
        }

        setLatestTransactions(latest);
        setMonthlyTransactions(currentMonth);
        setUpcomingPendingTransactions(upcomingPending);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar dados do dashboard.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Conta Clara
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard do mês
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Acompanhe suas contas, gastos e saldo previsto de forma simples.
          </p>
        </div>

        <AppLinkButton href="/lancamentos/novo">Novo lançamento</AppLinkButton>
      </header>

      <section className="mb-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-300">Saúde do mês</p>

            <h2 className="mt-2 text-2xl font-bold">
              {monthlyTransactions.length > 0
                ? monthlySummary.predictedBalance >= 0
                  ? "Seu mês está positivo"
                  : "Seu mês precisa de atenção"
                : "Seu mês ainda está em análise"}
            </h2>

            <p className="mt-2 text-sm text-emerald-100/80">
              {monthlyTransactions.length > 0
                ? "Resumo calculado com base nos lançamentos cadastrados para o mês atual."
                : "Conforme você cadastra receitas e despesas, o Conta Clara mostra como está sua situação financeira."}
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-950/50 px-5 py-4 text-center">
            <p className="text-xs tracking-[0.2em] text-zinc-400 uppercase">
              Status
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-300">
              {monthlyTransactions.length > 0
                ? monthlySummary.predictedBalance >= 0
                  ? "Em equilíbrio"
                  : "Atenção"
                : "Acompanhando"}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Receitas do mês"
          value={isLoading ? "..." : formatCurrency(monthlySummary.incomeTotal)}
          description="Entradas cadastradas para o mês atual."
          tone="emerald"
        />

        <SummaryCard
          title="Despesas do mês"
          value={
            isLoading ? "..." : formatCurrency(monthlySummary.expenseTotal)
          }
          description="Gastos e contas cadastrados no período."
          tone="red"
        />

        <SummaryCard
          title="Saldo previsto"
          value={
            isLoading ? "..." : formatCurrency(monthlySummary.predictedBalance)
          }
          description="Diferença entre receitas e despesas do mês."
          tone={monthlySummary.predictedBalance >= 0 ? "emerald" : "red"}
        />

        <SummaryCard
          title="Contas pendentes"
          value={isLoading ? "..." : monthlySummary.pendingCount}
          description="Lançamentos ainda não marcados como pagos."
          tone="yellow"
        />
      </section>

      {errorMessage && (
        <div className="mb-8 rounded-2xl bg-red-400/10 p-4 text-center text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AppSection
            title="Últimos lançamentos"
            description="Os lançamentos mais recentes aparecem aqui."
          >
            {isLoading && (
              <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
                <p className="text-sm text-zinc-400">
                  Carregando lançamentos...
                </p>
              </div>
            )}

            {!isLoading && !errorMessage && latestTransactions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
                <p className="text-sm text-zinc-400">
                  Nenhum lançamento cadastrado ainda.
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Comece adicionando sua primeira receita ou despesa.
                </p>
              </div>
            )}

            {!isLoading && !errorMessage && latestTransactions.length > 0 && (
              <div className="space-y-3">
                {latestTransactions.map((transaction) => {
                  const isIncome = transaction.type === "income";

                  return (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {transaction.description}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          Vencimento: {formatDate(transaction.due_date)} •{" "}
                          {statusLabels[transaction.status]}
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
            )}
          </AppSection>

          <AppSection
            title="Receitas x despesas"
            description="Compare suas receitas e despesas cadastradas no mês atual."
          >
            <IncomeExpenseChart
              incomeTotal={monthlySummary.incomeTotal}
              expenseTotal={monthlySummary.expenseTotal}
              isLoading={isLoading}
            />
          </AppSection>
        </div>

        <aside className="space-y-6">
          <AppSection title="Próximas contas">
            {isLoading && (
              <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center">
                <p className="text-sm text-zinc-400">Carregando contas...</p>
              </div>
            )}

            {!isLoading && upcomingPendingTransactions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center">
                <p className="text-sm text-zinc-400">
                  Nenhuma conta próxima do vencimento.
                </p>
              </div>
            )}

            {!isLoading && upcomingPendingTransactions.length > 0 && (
              <div className="space-y-3">
                {upcomingPendingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {transaction.description}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          Vence em {formatDate(transaction.due_date)}
                        </p>
                      </div>

                      <strong className="text-sm text-red-300">
                        {formatCurrency(Number(transaction.amount))}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AppSection>

          <AppSection title="Resumo rápido">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-sm text-zinc-400">Mês atual</span>
                <strong className="text-sm capitalize">
                  {getCurrentMonthLabel()}
                </strong>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-sm text-zinc-400">Status</span>
                <strong className="text-sm text-emerald-300">
                  {monthlyTransactions.length > 0
                    ? monthlySummary.predictedBalance >= 0
                      ? "Em equilíbrio"
                      : "Atenção"
                    : "Acompanhando"}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Plano</span>
                <strong className="text-sm text-emerald-300">
                  Teste grátis
                </strong>
              </div>
            </div>
          </AppSection>

          <AppSection title="Próximos passos">
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>• Cadastrar primeira receita</li>
              <li>• Cadastrar primeira despesa</li>
              <li>• Organizar categorias</li>
              <li>• Acompanhar saldo do mês</li>
            </ul>
          </AppSection>
        </aside>
      </section>
    </main>
  );
}
