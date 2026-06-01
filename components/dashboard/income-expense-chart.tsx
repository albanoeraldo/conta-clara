"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type IncomeExpenseChartProps = {
  incomeTotal: number;
  expenseTotal: number;
  isLoading: boolean;
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
  isLoading,
}: IncomeExpenseChartProps) {
  const hasData = incomeTotal > 0 || expenseTotal > 0;

  const chartData = [
    {
      name: "Receitas",
      value: incomeTotal,
      fill: "#6ee7b7",
    },
    {
      name: "Despesas",
      value: expenseTotal,
      fill: "#fca5a5",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-zinc-700">
        <p className="text-sm text-zinc-500">Carregando gráfico...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-zinc-700">
        <p className="text-sm text-zinc-500">
          Gráfico será exibido quando houver lançamentos.
        </p>
      </div>
    );
  }

  return (
    <div className="h-56 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(Number(value))}
          />

          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
            contentStyle={{
              backgroundColor: "#09090b",
              border: "1px solid #27272a",
              borderRadius: "12px",
              color: "#ffffff",
            }}
            formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
          />

          <Bar dataKey="value" radius={[12, 12, 4, 4]}>
            {chartData.map((item) => (
              <Cell key={item.name} fill={item.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
