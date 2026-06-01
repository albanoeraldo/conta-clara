"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validations/auth";
import { getActiveCategories, type Category } from "@/services/categories";
import { getTransactionById, updateTransaction } from "@/services/transactions";

export default function EditarLancamentoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      categoryId: "",
      dueDate: "",
      status: "pending",
      paymentMethod: "pix",
      notes: "",
    },
  });

  const selectedType = useWatch({
    control,
    name: "type",
  });

  const filteredCategories = categories.filter(
    (category) => category.type === selectedType,
  );

  const loadTransaction = useCallback(async () => {
    try {
      setStatusMessage("");
      setStatusType("");

      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage("Você precisa estar logado para editar lançamentos.");
        return;
      }

      const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

      if (!currentFinancialSpaceId) {
        setStatusType("error");
        setStatusMessage(
          "Configure sua Conta Clara antes de editar lançamentos.",
        );
        return;
      }

      const [transaction, activeCategories] = await Promise.all([
        getTransactionById({
          transactionId: params.id,
          financialSpaceId: currentFinancialSpaceId,
        }),
        getActiveCategories(currentFinancialSpaceId),
      ]);

      setFinancialSpaceId(currentFinancialSpaceId);
      setCategories(activeCategories);

      reset({
        description: transaction.description,
        amount: String(transaction.amount),
        type: transaction.type,
        categoryId: transaction.category_id ?? "",
        dueDate: transaction.due_date,
        status: transaction.status === "paid" ? "paid" : "pending",
        paymentMethod: transaction.payment_method,
        notes: transaction.notes ?? "",
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao carregar lançamento.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.id, reset]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransaction();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTransaction]);

  async function onSubmit(data: TransactionFormData) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      await updateTransaction({
        transactionId: params.id,
        financialSpaceId,
        data: {
          type: data.type,
          description: data.description,
          amount: Number(data.amount),
          due_date: data.dueDate,
          paid_date: data.status === "paid" ? data.dueDate : null,
          status: data.status,
          payment_method: data.paymentMethod,
          notes: data.notes || null,
          category_id: data.categoryId || null,
        },
      });

      setStatusType("success");
      setStatusMessage("Lançamento atualizado com sucesso!");

      router.replace("/lancamentos");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar lançamento.",
      );
    }
  }

  if (isLoading) {
    return (
      <main>
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-xl">
          <p className="text-sm text-zinc-400">Carregando lançamento...</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
          Lançamentos
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Editar lançamento</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Atualize os dados da receita ou despesa selecionada.
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

          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Categoria
            </label>

            <select
              id="categoryId"
              {...register("categoryId")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            >
              <option value="">Sem categoria</option>

              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              href="/lancamentos"
              className="rounded-xl border border-zinc-700 px-5 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
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
