"use client";

import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, Save, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { AvatarPicker } from "@/components/profile/avatar-picker";
import { AppButton } from "@/components/ui/app-button";
import { AppFeedback } from "@/components/ui/app-feedback";
import { AppLoadingState } from "@/components/ui/app-loading-state";
import { AppSection } from "@/components/ui/app-section";
import { getCurrentUser } from "@/lib/auth/session";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { getProfile, saveProfile } from "@/services/profile";

export default function PerfilPage() {
  const [email, setEmail] = useState("");
  const [selectedAvatarKey, setSelectedAvatarKey] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
    },
  });

  const watchedFullName =
    useWatch({
      control,
      name: "fullName",
    }) || "Usuário Conta Clara";

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
      setSelectedAvatarKey(profile?.avatar_key ?? null);

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
        avatarKey: selectedAvatarKey,
      });

      window.dispatchEvent(new Event("conta-clara-profile-updated"));

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
    <main className="space-y-6">
      <div>
        <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
          Perfil
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Meu perfil
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Gerencie seus dados básicos da Conta Clara.
        </p>
      </div>

      <AppSection
        title="Dados pessoais"
        description="Atualize suas informações básicas de cadastro e escolha seu avatar."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <AvatarPicker
            value={selectedAvatarKey}
            userName={watchedFullName}
            onChange={setSelectedAvatarKey}
          />

          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Nome completo
            </label>

            <div className="relative">
              <UserRound className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="fullName"
                type="text"
                placeholder="Digite seu nome completo"
                {...register("fullName")}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {errors.fullName && (
              <p className="mt-2 text-sm font-semibold text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              E-mail
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 py-3 pr-4 pl-12 text-sm text-slate-500 outline-none"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              O e-mail fica somente leitura nesta fase.
            </p>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Telefone
            </label>

            <div className="relative">
              <Phone className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="phone"
                type="text"
                placeholder="Ex: (47) 99999-9999"
                {...register("phone")}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-12 text-sm text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {errors.phone && (
              <p className="mt-2 text-sm font-semibold text-red-500">
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
              <Save className="h-4 w-4" />
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
