"use client";

import { useEffect, useMemo, useState } from "react";

import { useReferenceMonth } from "@/hooks/use-reference-month";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories, type Category } from "@/services/categories";
import {
  getTransactionsByMonth,
  type Transaction,
} from "@/services/transactions";

type CategoryReportRow = {
  categoryId: string;
  categoryName: string;
  total: number;
  percentage: number;
  transactionCount: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getTransactionDate(transaction: Transaction) {
  if ("due_date" in transaction && typeof transaction.due_date === "string") {
    return transaction.due_date;
  }

  if ("date" in transaction && typeof transaction.date === "string") {
    return transaction.date;
  }

  if ("paid_at" in transaction && typeof transaction.paid_at === "string") {
    return transaction.paid_at;
  }

  return "";
}

function formatStatus(status: string) {
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    cancelled: "Cancelado",
  };

  return statusLabels[status] ?? status;
}

function buildCategoryReport(
  transactions: Transaction[],
  categories: Category[],
): CategoryReportRow[] {
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  const expenseTransactions = transactions.filter(
    (transaction) =>
      transaction.type === "expense" && transaction.status !== "cancelled",
  );

  const totalExpenses = expenseTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0,
  );

  const reportByCategory = new Map<
    string,
    {
      categoryName: string;
      total: number;
      transactionCount: number;
    }
  >();

  expenseTransactions.forEach((transaction) => {
    const categoryId = transaction.category_id ?? "uncategorized";
    const categoryName =
      categoryNameById.get(transaction.category_id ?? "") ?? "Sem categoria";

    const currentCategory = reportByCategory.get(categoryId);

    if (!currentCategory) {
      reportByCategory.set(categoryId, {
        categoryName,
        total: Number(transaction.amount),
        transactionCount: 1,
      });

      return;
    }

    reportByCategory.set(categoryId, {
      ...currentCategory,
      total: currentCategory.total + Number(transaction.amount),
      transactionCount: currentCategory.transactionCount + 1,
    });
  });

  return Array.from(reportByCategory.entries())
    .map(([categoryId, category]) => ({
      categoryId,
      categoryName: category.categoryName,
      total: category.total,
      percentage:
        totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0,
      transactionCount: category.transactionCount,
    }))
    .sort((firstCategory, secondCategory) => {
      return secondCategory.total - firstCategory.total;
    });
}

export default function ReportsPage() {
  const {
    referenceMonth,
    setReferenceMonth,
    resetReferenceMonth,
    referenceMonthLabel,
  } = useReferenceMonth();

  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>(
    [],
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const categoryReport = useMemo(() => {
    return buildCategoryReport(monthlyTransactions, categories);
  }, [monthlyTransactions, categories]);

  const totalExpenses = categoryReport.reduce(
    (total, category) => total + category.total,
    0,
  );

  const biggestCategory = categoryReport[0];

  const validMonthlyTransactions = useMemo(() => {
    return monthlyTransactions.filter(
      (transaction) => transaction.status !== "cancelled",
    );
  }, [monthlyTransactions]);

  const totalIncome = useMemo(() => {
    return validMonthlyTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }, [validMonthlyTransactions]);

  const monthlyBalance = totalIncome - totalExpenses;

  const hasMonthlyMovement = validMonthlyTransactions.length > 0;

  const categoryNameById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const biggestExpenses = useMemo(() => {
    return monthlyTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense" && transaction.status !== "cancelled",
      )
      .sort((firstTransaction, secondTransaction) => {
        return (
          Number(secondTransaction.amount) - Number(firstTransaction.amount)
        );
      })
      .slice(0, 5);
  }, [monthlyTransactions]);

  const biggestExpense = biggestExpenses[0];

  useEffect(() => {
    let isMounted = true;

    async function loadReportsData() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const user = await getCurrentUser();

        if (!user) {
          return;
        }

        const financialSpaceId = await getUserFinancialSpaceId(user.id);

        if (!financialSpaceId) {
          return;
        }

        const [selectedMonthTransactions, userCategories] = await Promise.all([
          getTransactionsByMonth(financialSpaceId, referenceMonth),
          getCategories(financialSpaceId),
        ]);

        if (!isMounted) {
          return;
        }

        setMonthlyTransactions(selectedMonthTransactions);
        setCategories(userCategories);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar relatório mensal.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadReportsData();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [referenceMonth]);

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
              Relatórios
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Relatório mensal por categoria
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              Entenda onde o dinheiro está indo em {referenceMonthLabel}, com um
              resumo simples por categoria.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
              <label htmlFor="reportsReferenceMonth" className="sr-only">
                Mês de referência
              </label>

              <input
                id="reportsReferenceMonth"
                type="month"
                value={referenceMonth}
                onChange={(event) => setReferenceMonth(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="button"
              onClick={resetReferenceMonth}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Atual
            </button>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-red-600">Total de despesas</p>

          <strong className="mt-4 block text-2xl font-black text-red-600">
            {isLoading ? "..." : formatCurrency(totalExpenses)}
          </strong>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Soma das despesas válidas em {referenceMonthLabel}.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-700">
            Categorias com gasto
          </p>

          <strong className="mt-4 block text-2xl font-black text-blue-700">
            {isLoading ? "..." : categoryReport.length}
          </strong>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Quantidade de categorias encontradas no mês.
          </p>
        </div>

        <div className="rounded-3xl border border-yellow-100 bg-yellow-50 p-6 shadow-sm">
          <p className="text-sm font-bold text-yellow-700">Maior gasto</p>

          <strong className="mt-4 block text-2xl font-black text-yellow-700">
            {isLoading
              ? "..."
              : biggestCategory
                ? biggestCategory.categoryName
                : "Nenhum"}
          </strong>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Categoria que mais pesou no mês selecionado.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            Inteligência simples
          </p>

          <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
            Resumo inteligente do mês
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Uma leitura simples do seu mês financeiro em {referenceMonthLabel}.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Gerando resumo do mês...
          </div>
        )}

        {!isLoading && !errorMessage && !hasMonthlyMovement && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-8">
            <h3 className="text-lg font-black text-slate-950">
              Nenhuma movimentação encontrada
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Quando houver receitas ou despesas em {referenceMonthLabel}, o
              Conta Clara vai montar um resumo simples para você.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && hasMonthlyMovement && (
          <div
            className={`rounded-3xl border p-6 ${
              monthlyBalance >= 0
                ? "border-emerald-100 bg-emerald-50"
                : "border-red-100 bg-red-50"
            }`}
          >
            <p className="text-base leading-8 text-slate-700">
              Em <strong>{referenceMonthLabel}</strong>, você teve{" "}
              <strong className="text-emerald-700">
                {formatCurrency(totalIncome)}
              </strong>{" "}
              de receitas e{" "}
              <strong className="text-red-500">
                {formatCurrency(totalExpenses)}
              </strong>{" "}
              de despesas.
            </p>

            <p className="mt-4 text-base leading-8 text-slate-700">
              Seu saldo previsto ficou{" "}
              <strong
                className={
                  monthlyBalance >= 0 ? "text-emerald-700" : "text-red-600"
                }
              >
                {monthlyBalance >= 0 ? "positivo" : "negativo"} em{" "}
                {formatCurrency(Math.abs(monthlyBalance))}
              </strong>
              .
            </p>

            {biggestCategory && (
              <p className="mt-4 text-base leading-8 text-slate-700">
                A categoria que mais pesou foi{" "}
                <strong>{biggestCategory.categoryName}</strong>, representando{" "}
                <strong>
                  {biggestCategory.percentage.toFixed(1).replace(".", ",")}%
                </strong>{" "}
                das despesas do mês.
              </p>
            )}

            {biggestExpense && (
              <p className="mt-4 text-base leading-8 text-slate-700">
                Sua maior despesa individual foi{" "}
                <strong>{biggestExpense.description}</strong>, no valor de{" "}
                <strong>{formatCurrency(Number(biggestExpense.amount))}</strong>
                .
              </p>
            )}
          </div>
        )}
      </section>

      {!isLoading &&
        !errorMessage &&
        categoryReport.length > 0 &&
        biggestCategory && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
                Visual
              </p>

              <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
                Top categorias do mês
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Uma visão simples das categorias que mais pesaram em{" "}
                {referenceMonthLabel}.
              </p>
            </div>

            <div className="space-y-5">
              {categoryReport.slice(0, 5).map((category, index) => {
                const barWidth =
                  biggestCategory.total > 0
                    ? Math.max(
                        (category.total / biggestCategory.total) * 100,
                        8,
                      )
                    : 0;

                return (
                  <div key={category.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-slate-950">
                          {index + 1}. {category.categoryName}
                        </p>

                        <p className="text-xs font-semibold text-slate-500">
                          {category.percentage.toFixed(1).replace(".", ",")}%
                          das despesas
                        </p>
                      </div>

                      <strong className="text-sm font-black text-red-500">
                        {formatCurrency(category.total)}
                      </strong>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl bg-blue-50 p-5">
              <p className="text-sm leading-6 text-blue-900">
                Sua maior categoria de gasto em {referenceMonthLabel} foi{" "}
                <strong>{biggestCategory.categoryName}</strong>, com{" "}
                <strong>{formatCurrency(biggestCategory.total)}</strong>.
              </p>
            </div>
          </section>
        )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            Destaques
          </p>

          <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
            Maiores despesas do mês
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Os gastos individuais que mais pesaram em {referenceMonthLabel}.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Carregando maiores despesas...
          </div>
        )}

        {!isLoading && !errorMessage && biggestExpenses.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-8">
            <h3 className="text-lg font-black text-slate-950">
              Nenhuma despesa encontrada
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Quando houver despesas em {referenceMonthLabel}, as maiores
              aparecerão aqui.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && biggestExpenses.length > 0 && (
          <div className="space-y-3">
            {biggestExpenses.map((transaction, index) => {
              const categoryName =
                categoryNameById.get(transaction.category_id ?? "") ??
                "Sem categoria";

              return (
                <div
                  key={`${transaction.description}-${index}`}
                  className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-black text-blue-700">
                      #{index + 1}
                    </p>

                    <h3 className="mt-1 truncate text-base font-black text-slate-950">
                      {transaction.description}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">
                        {categoryName}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">
                        {formatDate(getTransactionDate(transaction))}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-slate-600">
                        {formatStatus(transaction.status)}
                      </span>
                    </div>
                  </div>

                  <strong className="text-xl font-black text-red-500">
                    {formatCurrency(Number(transaction.amount))}
                  </strong>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Ranking de despesas por categoria
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lista ordenada da maior despesa para a menor.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Carregando relatório...
          </div>
        )}

        {!isLoading && !errorMessage && categoryReport.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-8">
            <h3 className="text-lg font-black text-slate-950">
              Nenhuma despesa encontrada
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Quando houver despesas cadastradas em {referenceMonthLabel}, elas
              aparecerão aqui agrupadas por categoria.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && categoryReport.length > 0 && (
          <div className="space-y-4">
            {categoryReport.map((category, index) => (
              <div
                key={category.categoryId}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-blue-700">
                      #{index + 1}
                    </p>

                    <h3 className="mt-1 text-lg font-black text-slate-950">
                      {category.categoryName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {category.transactionCount} lançamento
                      {category.transactionCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <strong className="block text-xl font-black text-red-500">
                      {formatCurrency(category.total)}
                    </strong>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {category.percentage.toFixed(1).replace(".", ",")}% das
                      despesas
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
