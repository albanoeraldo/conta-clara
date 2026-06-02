"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type IncomeExpenseChartProps = {
  incomeTotal: number;
  expenseTotal: number;
  isLoading?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function IncomeExpenseChart({
  incomeTotal,
  expenseTotal,
  isLoading = false,
}: IncomeExpenseChartProps) {
  const data = [
    {
      name: "Receitas",
      value: incomeTotal,
      fill: "#2563eb",
    },
    {
      name: "Despesas",
      value: expenseTotal,
      fill: "#f87171",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-100 bg-white text-sm font-semibold text-slate-500 shadow-sm">
        Carregando gráfico...
      </div>
    );
  }

  return (
    <div className="min-h-64 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={72}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />

          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              color: "#0f172a",
            }}
            labelStyle={{
              color: "#0f172a",
              fontWeight: 800,
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
          />

          <Bar dataKey="value" radius={[16, 16, 8, 8]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
