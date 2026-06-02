"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Car,
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
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
  Wifi,
} from "lucide-react";

import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { AppLinkButton } from "@/components/ui/app-button";
import { AppEmptyState } from "@/components/ui/app-empty-state";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories, type Category } from "@/services/categories";
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

type MetricCardProps = {
  title: string;
  value: string | number;
  description: string;
  tone: "blue" | "red" | "yellow" | "green";
  icon: ComponentType<{ className?: string }>;
};

const metricStyles = {
  blue: {
    card: "border-blue-100 bg-blue-50 shadow-sm",
    icon: "bg-blue-600 text-white",
    title: "text-blue-700",
    value: "text-blue-700",
  },
  red: {
    card: "border-red-100 bg-red-50 shadow-sm",
    icon: "bg-red-500 text-white",
    title: "text-red-600",
    value: "text-red-600",
  },
  yellow: {
    card: "border-yellow-100 bg-yellow-50 shadow-sm",
    icon: "bg-yellow-400 text-white",
    title: "text-yellow-700",
    value: "text-yellow-700",
  },
  green: {
    card: "border-emerald-100 bg-emerald-50 shadow-sm",
    icon: "bg-emerald-500 text-white",
    title: "text-emerald-700",
    value: "text-emerald-700",
  },
};

function MetricCard({
  title,
  value,
  description,
  tone,
  icon: Icon,
}: MetricCardProps) {
  const styles = metricStyles[tone];

  return (
    <div className={`rounded-3xl border p-6 ${styles.card}`}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-bold ${styles.title}`}>{title}</p>

          <strong className={`mt-4 block text-2xl font-black ${styles.value}`}>
            {value}
          </strong>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function DashboardPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-tight text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
}

export default function DashboardPage() {
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>(
    [],
  );
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>(
    [],
  );
  const [upcomingPendingTransactions, setUpcomingPendingTransactions] =
    useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

        const [latest, currentMonth, upcomingPending, userCategories] =
          await Promise.all([
            getLatestTransactions(financialSpaceId),
            getCurrentMonthTransactions(financialSpaceId),
            getUpcomingPendingTransactions(financialSpaceId),
            getCategories(financialSpaceId),
          ]);

        if (!isMounted) {
          return;
        }

        setLatestTransactions(latest);
        setMonthlyTransactions(currentMonth);
        setUpcomingPendingTransactions(upcomingPending);
        setCategories(userCategories);
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

  const monthStatus =
    monthlyTransactions.length > 0
      ? monthlySummary.predictedBalance >= 0
        ? "Em equilíbrio"
        : "Atenção"
      : "Acompanhando";

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            Conta Clara
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Dashboard do mês
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Acompanhe suas receitas, despesas, contas pendentes e saldo previsto
            de forma simples.
          </p>
        </div>

        <AppLinkButton href="/lancamentos/novo">
          <Plus className="h-4 w-4" />
          Novo lançamento
        </AppLinkButton>
      </header>

      {errorMessage && (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-700">Saúde do mês</p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {monthlyTransactions.length > 0
                ? monthlySummary.predictedBalance >= 0
                  ? "Seu mês está positivo"
                  : "Seu mês precisa de atenção"
                : "Seu mês ainda está em análise"}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {monthlyTransactions.length > 0
                ? "Resumo calculado com base nos lançamentos cadastrados para o mês atual."
                : "Conforme você cadastra receitas e despesas, o Conta Clara mostra como está sua situação financeira."}
            </p>
          </div>

          <div className="rounded-3xl bg-white px-6 py-4 text-center">
            <p className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
              Status
            </p>

            <p className="mt-1 text-lg font-black text-blue-700">
              {monthStatus}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Receitas"
          value={isLoading ? "..." : formatCurrency(monthlySummary.incomeTotal)}
          description="Entradas cadastradas para o mês atual."
          tone="green"
          icon={ArrowUpRight}
        />

        <MetricCard
          title="Despesas"
          value={
            isLoading ? "..." : formatCurrency(monthlySummary.expenseTotal)
          }
          description="Gastos e contas cadastrados no período."
          tone="red"
          icon={ArrowDownRight}
        />

        <MetricCard
          title="Saldo do mês"
          value={
            isLoading ? "..." : formatCurrency(monthlySummary.predictedBalance)
          }
          description="Diferença entre receitas e despesas."
          tone={monthlySummary.predictedBalance >= 0 ? "blue" : "red"}
          icon={Wallet}
        />

        <MetricCard
          title="A vencer"
          value={isLoading ? "..." : monthlySummary.pendingCount}
          description="Lançamentos ainda não marcados como pagos."
          tone="yellow"
          icon={CalendarClock}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DashboardPanel
          title="Receitas x despesas"
          description="Compare suas receitas e despesas cadastradas no mês atual."
        >
          <IncomeExpenseChart
            incomeTotal={monthlySummary.incomeTotal}
            expenseTotal={monthlySummary.expenseTotal}
            isLoading={isLoading}
          />
        </DashboardPanel>

        <DashboardPanel
          title="Resumo rápido"
          description="Informações principais do período atual."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm font-medium text-slate-500">
                Mês atual
              </span>

              <strong className="text-sm font-black text-slate-800 capitalize">
                {getCurrentMonthLabel()}
              </strong>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm font-medium text-slate-500">Status</span>

              <strong className="text-sm font-black text-blue-700">
                {monthStatus}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Plano</span>

              <strong className="text-sm font-black text-blue-700">
                Teste grátis
              </strong>
            </div>
          </div>
        </DashboardPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardPanel
          title="Últimos lançamentos"
          description="Os lançamentos mais recentes aparecem aqui."
        >
          {isLoading && (
            <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Carregando lançamentos...
            </div>
          )}

          {!isLoading && !errorMessage && latestTransactions.length === 0 && (
            <AppEmptyState
              variant="transactions"
              title="Nenhum lançamento cadastrado ainda"
              description="Comece adicionando sua primeira receita ou despesa para visualizar seu mês ganhar forma."
              action={
                <AppLinkButton href="/lancamentos/novo" size="sm">
                  Adicionar lançamento
                </AppLinkButton>
              }
            />
          )}

          {!isLoading && !errorMessage && latestTransactions.length > 0 && (
            <div className="space-y-3">
              {latestTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                const category = categories.find(
                  (currentCategory) =>
                    currentCategory.id === transaction.category_id,
                );
                const Icon = getCategoryIcon(category, transaction.type);

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                          isIncome
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">
                          {transaction.description}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Vencimento: {formatDate(transaction.due_date)} •{" "}
                          {statusLabels[transaction.status]}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {category?.name ?? "Sem categoria"}
                        </p>
                      </div>
                    </div>

                    <strong
                      className={`text-base font-black ${
                        isIncome ? "text-blue-700" : "text-red-500"
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
        </DashboardPanel>

        <DashboardPanel title="Próximas contas">
          {isLoading && (
            <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
              Carregando próximas contas...
            </div>
          )}

          {!isLoading && upcomingPendingTransactions.length === 0 && (
            <AppEmptyState
              variant="dashboard"
              eyebrow="Tudo em dia"
              title="Nenhuma conta pendente"
              description="Quando houver despesas pendentes no mês atual, elas aparecerão aqui para você acompanhar com calma."
            />
          )}

          {!isLoading && upcomingPendingTransactions.length > 0 && (
            <div className="space-y-3">
              {upcomingPendingTransactions.map((transaction) => {
                const category = categories.find(
                  (currentCategory) =>
                    currentCategory.id === transaction.category_id,
                );
                const Icon = getCategoryIcon(category, transaction.type);

                return (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="font-black text-slate-950">
                            {transaction.description}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Vence em {formatDate(transaction.due_date)}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {category?.name ?? "Sem categoria"}
                          </p>
                        </div>
                      </div>

                      <strong className="text-sm font-black text-red-500">
                        {formatCurrency(Number(transaction.amount))}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardPanel>
      </section>
    </main>
  );
}
