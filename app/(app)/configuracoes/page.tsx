"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getCurrentUser } from "@/lib/auth/session";
import {
  financialSpaceSchema,
  type FinancialSpaceFormData,
} from "@/lib/validations/financial-space";
import {
  getFinancialSpaceByOwnerId,
  updateFinancialSpace,
} from "@/services/financial-space";

export default function ConfiguracoesPage() {
  const [financialSpaceId, setFinancialSpaceId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FinancialSpaceFormData>({
    resolver: zodResolver(financialSpaceSchema),
    defaultValues: {
      name: "",
      type: "personal",
      monthlyIncome: "",
    },
  });

  const loadFinancialSpace = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage(
          "Você precisa estar logado para acessar as configurações.",
        );
        return;
      }

      const financialSpace = await getFinancialSpaceByOwnerId(user.id);

      if (!financialSpace) {
        setStatusType("error");
        setStatusMessage(
          "Nenhum espaço financeiro encontrado. Conclua o onboarding primeiro.",
        );
        return;
      }

      setOwnerId(user.id);
      setFinancialSpaceId(financialSpace.id);

      reset({
        name: financialSpace.name,
        type: financialSpace.type,
        monthlyIncome:
          financialSpace.monthly_income !== null
            ? String(financialSpace.monthly_income)
            : "",
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao carregar configurações.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFinancialSpace();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadFinancialSpace]);

  async function onSubmit(data: FinancialSpaceFormData) {
    setStatusMessage("");
    setStatusType("");

    if (!financialSpaceId || !ownerId) {
      setStatusType("error");
      setStatusMessage("Não foi possível identificar sua Conta Clara.");
      return;
    }

    try {
      await updateFinancialSpace({
        financialSpaceId,
        ownerId,
        name: data.name,
        type: data.type,
        monthlyIncome: data.monthlyIncome,
      });

      setStatusType("success");
      setStatusMessage("Configurações atualizadas com sucesso!");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro ao salvar configurações.",
      );
    }
  }

  if (isLoading) {
    return (
      <main>
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-xl">
          <p className="text-sm text-zinc-400">Carregando configurações...</p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
          Configurações
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Espaço financeiro</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Gerencie as configurações principais da sua Conta Clara.
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Nome do controle financeiro
            </label>

            <input
              id="name"
              type="text"
              placeholder="Ex: Minha Casa, Finanças do Casal"
              {...register("name")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Tipo de uso
            </label>

            <select
              id="type"
              {...register("type")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            >
              <option value="personal">Pessoal</option>
              <option value="couple">Casal</option>
              <option value="family">Família</option>
              <option value="business">Negócio</option>
            </select>

            {errors.type && (
              <p className="mt-2 text-sm text-red-400">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthlyIncome"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Renda mensal aproximada
            </label>

            <input
              id="monthlyIncome"
              type="number"
              step="0.01"
              placeholder="Ex: 3500"
              {...register("monthlyIncome")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.monthlyIncome && (
              <p className="mt-2 text-sm text-red-400">
                {errors.monthlyIncome.message}
              </p>
            )}

            <p className="mt-2 text-xs text-zinc-500">
              Essa informação ajuda o Conta Clara a contextualizar seus resumos.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Salvando..." : "Salvar configurações"}
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
