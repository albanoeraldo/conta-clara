"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { formatMoneyInput, moneyInputToNumber } from "@/lib/utils/money";

import { AppButton, AppLinkButton } from "@/components/ui/app-button";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppSection } from "@/components/ui/app-section";
import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validations/auth";
import { getActiveCategories, type Category } from "@/services/categories";

export default function NovoLancamentoPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
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
      type: "expense",
      categoryId: "",
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

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          return;
        }

        const currentFinancialSpaceId = await getUserFinancialSpaceId(user.id);

        if (!currentFinancialSpaceId) {
          return;
        }

        const activeCategories = await getActiveCategories(
          currentFinancialSpaceId,
        );

        if (!isMounted) {
          return;
        }

        setFinancialSpaceId(currentFinancialSpaceId);
        setCategories(activeCategories);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStatusType("error");
        setStatusMessage(
          error instanceof Error
            ? error.message
            : "Erro ao carregar categorias.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  async function onSubmit(data: TransactionFormData) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId) {
      setStatusType("error");
      setStatusMessage("Configure sua Conta Clara antes de criar lançamentos.");
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      financial_space_id: financialSpaceId,
      category_id: data.categoryId || null,
      type: data.type,
      description: data.description,
      amount: moneyInputToNumber(data.amount),
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
      description: "",
      amount: "",
      type: "expense",
      categoryId: "",
      dueDate: "",
      status: "pending",
      paymentMethod: "pix",
      notes: "",
    });
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Lançamentos
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Novo lançamento
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Cadastre uma receita ou despesa para acompanhar melhor seu mês.
        </p>
      </div>

      <AppSection
        title="Dados do lançamento"
        description="Preencha as informações principais da receita ou despesa."
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
              disabled={isLoadingCategories}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {isLoadingCategories
                  ? "Carregando categorias..."
                  : "Sem categoria"}
              </option>

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
              {isSubmitting ? "Salvando..." : "Salvar lançamento"}
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
