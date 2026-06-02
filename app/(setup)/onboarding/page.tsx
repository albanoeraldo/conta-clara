"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleDollarSign, Home, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { supabase } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/lib/validations/auth";
import { createDefaultCategories } from "@/services/categories";

export default function OnboardingPage() {
  const router = useRouter();

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      spaceType: "personal",
      monthlyIncome: "",
    },
  });

  async function onSubmit(data: OnboardingFormData) {
    setStatusMessage("");
    setStatusType("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setStatusType("error");
      setStatusMessage("Você precisa estar logado para configurar sua conta.");
      return;
    }

    const { data: existingSpace, error: existingSpaceError } = await supabase
      .from("financial_spaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (existingSpaceError) {
      setStatusType("error");
      setStatusMessage(existingSpaceError.message);
      return;
    }

    let financialSpaceId = existingSpace?.id;

    if (existingSpace) {
      const { error: updateSpaceError } = await supabase
        .from("financial_spaces")
        .update({
          name: data.spaceName,
          type: data.spaceType,
          monthly_income: data.monthlyIncome
            ? Number(data.monthlyIncome)
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSpace.id);

      if (updateSpaceError) {
        setStatusType("error");
        setStatusMessage(updateSpaceError.message);
        return;
      }
    } else {
      const { data: createdSpace, error: createSpaceError } = await supabase
        .from("financial_spaces")
        .insert({
          owner_id: user.id,
          name: data.spaceName,
          type: data.spaceType,
          monthly_income: data.monthlyIncome
            ? Number(data.monthlyIncome)
            : null,
        })
        .select("id")
        .single();

      if (createSpaceError) {
        setStatusType("error");
        setStatusMessage(createSpaceError.message);
        return;
      }

      financialSpaceId = createdSpace.id;
    }

    const { data: existingSubscription, error: existingSubscriptionError } =
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingSubscriptionError) {
      setStatusType("error");
      setStatusMessage(existingSubscriptionError.message);
      return;
    }

    if (!existingSubscription && financialSpaceId) {
      const { error: subscriptionError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          financial_space_id: financialSpaceId,
        });

      if (subscriptionError) {
        setStatusType("error");
        setStatusMessage(subscriptionError.message);
        return;
      }
    }

    if (financialSpaceId) {
      await createDefaultCategories(financialSpaceId);
    }

    setStatusType("success");
    setStatusMessage(
      "Conta Clara configurada com sucesso! Em breve você será levado para o painel.",
    );

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-4xl border border-slate-100 bg-white p-7 shadow-sm sm:p-10">
            <div className="mb-8 flex justify-center">
              <Link
                href="/"
                aria-label="Ir para o Conta Clara"
                className="inline-flex"
              >
                <div className="flex h-24 w-80 items-center justify-center">
                  <Image
                    src="/brand/conta-clara-logo-horizontal.png"
                    alt="Conta Clara"
                    width={420}
                    height={180}
                    priority
                    className="h-auto w-72 object-contain"
                  />
                </div>
              </Link>
            </div>

            <div className="mb-8 text-center">
              <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
                Primeiro acesso
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Vamos configurar seu controle
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Responda algumas informações rápidas para deixar seu painel
                pronto para acompanhar receitas, despesas e contas do mês.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="spaceName"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Nome do controle financeiro
                </label>

                <div className="relative">
                  <Home className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="spaceName"
                    type="text"
                    placeholder="Ex: Minha Casa, Finanças do Casal"
                    {...register("spaceName")}
                    className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {errors.spaceName && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {errors.spaceName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="spaceType"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Tipo de uso
                </label>

                <div className="relative">
                  <UsersRound className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    id="spaceType"
                    {...register("spaceType")}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="personal">Pessoal</option>
                    <option value="couple">Casal</option>
                    <option value="family">Família</option>
                  </select>
                </div>

                {errors.spaceType && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {errors.spaceType.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="monthlyIncome"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Renda mensal aproximada
                </label>

                <div className="relative">
                  <CircleDollarSign className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="monthlyIncome"
                    type="number"
                    placeholder="Ex: 3500"
                    {...register("monthlyIncome")}
                    className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 py-4 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                {errors.monthlyIncome && (
                  <p className="mt-2 text-sm font-semibold text-red-500">
                    {errors.monthlyIncome.message}
                  </p>
                )}

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Essa informação será usada apenas para ajudar nos resumos do
                  seu painel.
                </p>
              </div>

              {statusMessage && statusType && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    statusType === "success"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Salvando..." : "Salvar e ir para o painel"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
