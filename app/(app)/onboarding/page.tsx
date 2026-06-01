"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { supabase } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/lib/validations/auth";

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

    setStatusType("success");
    setStatusMessage(
      "Conta Clara configurada com sucesso! Em breve você será levado para o painel.",
    );

    router.replace("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Conta Clara
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Vamos configurar seu controle
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Responda algumas informações rápidas para deixar seu painel pronto
            para uso.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="spaceName"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Nome do controle financeiro
            </label>

            <input
              id="spaceName"
              type="text"
              placeholder="Ex: Minha Casa, Finanças do Casal"
              {...register("spaceName")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.spaceName && (
              <p className="mt-2 text-sm text-red-400">
                {errors.spaceName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="spaceType"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Tipo de uso
            </label>

            <select
              id="spaceType"
              {...register("spaceType")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none focus:border-emerald-400"
            >
              <option value="personal">Pessoal</option>
              <option value="couple">Casal</option>
              <option value="family">Família</option>
            </select>

            {errors.spaceType && (
              <p className="mt-2 text-sm text-red-400">
                {errors.spaceType.message}
              </p>
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
              Essa informação será usada apenas para ajudar nos resumos do seu
              painel.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Salvando..." : "Salvar e ir para o painel"}
          </button>

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
