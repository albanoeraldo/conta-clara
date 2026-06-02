"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  formatMoneyInput,
  moneyInputToNumber,
  numberToMoneyInput,
} from "@/lib/utils/money";

import { AppButton, AppLinkButton } from "@/components/ui/app-button";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppSection } from "@/components/ui/app-section";
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
        amount: numberToMoneyInput(transaction.amount),
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
          amount: moneyInputToNumber(data.amount),
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
        <AppSection>
          <AppLoadingState message="Carregando lançamento..." />
        </AppSection>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Lançamentos
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Editar lançamento
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Atualize os dados da receita ou despesa selecionada.
        </p>
      </div>

      <AppSection
        title="Dados do lançamento"
        description="Revise e atualize as informações cadastradas."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Descrição
            </label>

            <input
              id="description"
              type="text"
              placeholder="Ex: Salário, Mercado, Internet"
              {...register("description")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.description && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Valor
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm font-bold text-slate-400">
                  R$
                </span>

                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(formatMoneyInput(event.target.value))
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>

              {errors.amount && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="type"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Tipo
              </label>

              <select
                id="type"
                {...register("type")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>

              {errors.type && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="categoryId"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Categoria
            </label>

            <select
              id="categoryId"
              {...register("categoryId")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Sem categoria</option>

              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div>
              <label
                htmlFor="dueDate"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Data de vencimento
              </label>

              <input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {errors.dueDate && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                {...register("status")}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
              </select>

              {errors.status && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="paymentMethod"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Forma de pagamento
            </label>

            <select
              id="paymentMethod"
              {...register("paymentMethod")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Observações
            </label>

            <textarea
              id="notes"
              placeholder="Adicione alguma observação, se necessário"
              {...register("notes")}
              className="min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.notes && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AppLinkButton href="/lancamentos" variant="secondary">
              Cancelar
            </AppLinkButton>

            <AppButton type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </AppButton>
          </div>

          {statusMessage && statusType && (
            <AppFeedback type={statusType} message={statusMessage} />
          )}
        </form>
      </AppSection>
    </main>
  );
}
