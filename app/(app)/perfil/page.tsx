"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppSection } from "@/components/ui/app-section";
import { AppButton } from "@/components/ui/app-button";
import { getCurrentUser } from "@/lib/auth/session";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { getProfile, saveProfile } from "@/services/profile";

export default function PerfilPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  const loadProfile = useCallback(async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage("Você precisa estar logado para acessar o perfil.");
        return;
      }

      const profile = await getProfile(user.id);
      const userEmail = user.email ?? "";

      setEmail(userEmail);

      reset({
        fullName:
          profile?.full_name ??
          user.user_metadata.full_name ??
          "Usuário Conta Clara",
        phone: profile?.phone ?? "",
      });
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao carregar perfil.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProfile]);

  async function onSubmit(data: ProfileFormData) {
    setStatusMessage("");
    setStatusType("");

    try {
      const user = await getCurrentUser();

      if (!user) {
        setStatusType("error");
        setStatusMessage("Você precisa estar logado para salvar o perfil.");
        return;
      }

      await saveProfile({
        userId: user.id,
        fullName: data.fullName,
        email,
        phone: data.phone,
      });

      setStatusType("success");
      setStatusMessage("Perfil atualizado com sucesso!");
    } catch (error) {
      setStatusType("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Erro ao salvar perfil.",
      );
    }
  }

  if (isLoading) {
    return (
      <main>
        <AppSection>
          <AppLoadingState message="Carregando perfil..." />
        </AppSection>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
          Perfil
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Meu perfil</h1>

        <p className="mt-2 text-sm text-zinc-400">
          Gerencie seus dados básicos da Conta Clara.
        </p>
      </div>

      <AppSection
        title="Dados pessoais"
        description="Atualize suas informações básicas de cadastro."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Nome completo
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Digite seu nome completo"
              {...register("fullName")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.fullName && (
              <p className="mt-2 text-sm text-red-400">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400 outline-none"
            />

            <p className="mt-2 text-xs text-zinc-500">
              O e-mail fica somente leitura nesta fase.
            </p>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Telefone
            </label>

            <input
              id="phone"
              type="text"
              placeholder="Ex: (47) 99999-9999"
              {...register("phone")}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white transition outline-none placeholder:text-zinc-500 focus:border-emerald-400"
            />

            {errors.phone && (
              <p className="mt-2 text-sm text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="flex justify-stretch sm:justify-end">
            <AppButton
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Salvando..." : "Salvar perfil"}
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
