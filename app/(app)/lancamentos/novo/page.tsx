"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validations/auth";

export default function NovoLancamentoPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      status: "pending",
      paymentMethod: "pix",
      notes: "",
    },
  });

  async function onSubmit(data: TransactionFormData) {
    setStatusMessage("");
    setStatusType("");

    const user = await getCurrentUser();

    if (!user) {
      setStatusType("error");
      setStatusMessage("Você precisa estar logado para criar um lançamento.");
      return;
    }

    const financialSpaceId = await getUserFinancialSpaceId(user.id);

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Configure sua Conta Clara antes de criar lançamentos.");
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      financial_space_id: financialSpaceId,
      type: data.type,
      description: data.description,
      amount: Number(data.amount),
      due_date: data.dueDate,
      paid_date: data.status === "paid" ? data.dueDate : null,
      status: data.status,
      payment_method: data.paymentMethod,
      notes: data.notes || null,
    });

    if (error) {
      setStatusType("error");
      setStatusMessage(error.message);
      return;
    }

    setStatusType("success");
    setStatusMessage("Lançamento criado com sucesso!");

    reset({
      type: "expense",
      status: "pending",
      paymentMethod: "pix",
      notes: "",
    });
  }

  return (
    <main>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
          Lançamentos
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Novo lançamento</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Cadastre uma receita ou despesa para acompanhar melhor seu mês.
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Descrição
            </label>

            <input
              id="description"
              type="text"
              placeholder="Ex: Salário, Mercado, Internet"
              {...register("description")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.description && (
              <p className="mt-2 text-sm text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Valor
              </label>

              <input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Ex: 150.00"
                {...register("amount")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
              />

              {errors.amount && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Tipo
              </label>

              <select
                id="type"
                {...register("type")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>

              {errors.type && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="dueDate"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Data de vencimento
              </label>

              <input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
              />

              {errors.dueDate && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Status
              </label>

              <select
                id="status"
                {...register("status")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>

              {errors.status && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="paymentMethod"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Forma de pagamento
            </label>

            <select
              id="paymentMethod"
              {...register("paymentMethod")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            >
              <option value="pix">Pix</option>
              <option value="money">Dinheiro</option>
              <option value="debit">Débito</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="bank_transfer">Transferência bancária</option>
              <option value="boleto">Boleto</option>
              <option value="other">Outro</option>
            </select>

            {errors.paymentMethod && (
              <p className="mt-2 text-sm text-red-400">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Observações
            </label>

            <textarea
              id="notes"
              rows={4}
              placeholder="Adicione alguma observação, se necessário"
              {...register("notes")}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.notes && (
              <p className="mt-2 text-sm text-red-400">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Salvando..." : "Salvar lançamento"}
            </button>
          </div>

          {statusMessage && (
            <p
              className={`rounded-xl px-4 py-3 text-center text-sm ${
                statusType === "success"
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-red-400/10 text-red-300"
              }`}
            >
              {statusMessage}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
