"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Settings,
  Tags,
  UserRound,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { UserAvatar } from "@/components/profile/user-avatar";
import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";
import { getProfile } from "@/services/profile";

type MenuItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const quickAccessItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Resumo",
    description: "Visão geral do mês",
    icon: Wallet,
  },
  {
    href: "/lancamentos/novo",
    label: "Novo lançamento",
    description: "Cadastrar receita ou despesa",
    icon: Plus,
  },
  {
    href: "/lancamentos",
    label: "Lançamentos",
    description: "Ver contas do mês",
    icon: ListChecks,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    description: "Analisar o mês",
    icon: BarChart3,
  },
];

const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Resumo financeiro do mês",
    icon: LayoutDashboard,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    description: "Categorias, maiores despesas e fechamento",
    icon: BarChart3,
  },
  {
    href: "/lancamentos",
    label: "Lançamentos",
    description: "Receitas, despesas e pagamentos",
    icon: ListChecks,
  },
  {
    href: "/parcelamentos",
    label: "Parcelamentos",
    description: "Compras parceladas e financiamentos",
    icon: Landmark,
  },
  {
    href: "/cartoes",
    label: "Cartões",
    description: "Cartões de crédito e faturas",
    icon: CreditCard,
  },
  {
    href: "/contas-fixas",
    label: "Contas fixas",
    description: "Contas recorrentes do mês",
    icon: CalendarClock,
  },
  {
    href: "/categorias",
    label: "Categorias",
    description: "Organização das receitas e despesas",
    icon: Tags,
  },
  {
    href: "/perfil",
    label: "Perfil",
    description: "Dados da sua conta",
    icon: UserRound,
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    description: "Preferências do sistema",
    icon: Settings,
  },
];

export default function MenuPage() {
  const router = useRouter();

  const [userDisplayName, setUserDisplayName] = useState("Usuário");
  const [userAvatarKey, setUserAvatarKey] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const user = await getCurrentUser();

      if (!isMounted || !user) {
        return;
      }

      let profile = null;

      try {
        profile = await getProfile(user.id);
      } catch {
        profile = null;
      }

      if (!isMounted) {
        return;
      }

      const displayName =
        profile?.full_name ??
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split("@")[0] ??
        "Usuário";

      setUserDisplayName(displayName);
      setUserAvatarKey(profile?.avatar_key ?? null);
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);

    await supabase.auth.signOut();

    router.replace("/login");
  }

  const firstName = userDisplayName.split(" ")[0] || "Usuário";

  return (
    <main className="min-h-screen bg-[#0F2A5F] px-4 py-5 text-white lg:min-h-0 lg:rounded-4xl lg:p-6">
      <div className="mx-auto w-full max-w-md lg:max-w-3xl">
        <header className="mb-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <Logo href="/dashboard" variant="sidebar" />

            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-blue-100 uppercase ring-1 ring-white/10">
              Beta
            </span>
          </div>

          <section className="rounded-4xl bg-white/10 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <UserAvatar
                avatarKey={userAvatarKey}
                name={userDisplayName}
                size="lg"
                fallbackTone="dark"
              />

              <div className="min-w-0">
                <p className="truncate text-lg font-black text-white">
                  Olá, {firstName}
                </p>

                <p className="mt-1 text-sm font-medium text-blue-100">
                  Escolha uma área para continuar.
                </p>
              </div>
            </div>
          </section>
        </header>

        <section className="mb-6">
          <p className="mb-3 text-xs font-black tracking-[0.22em] text-blue-200 uppercase">
            Acessos rápidos
          </p>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-32 min-w-40 flex-col justify-between rounded-3xl bg-white/10 p-4 text-white ring-1 ring-white/10 transition active:scale-[0.98]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm leading-5 font-black">{item.label}</p>

                    <p className="mt-1 text-xs leading-5 text-blue-100">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-black tracking-[0.22em] text-blue-200 uppercase">
            Menu principal
          </p>

          <nav className="grid gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-20 items-center gap-4 rounded-3xl bg-white/5 px-4 py-4 text-white ring-1 ring-white/10 transition hover:bg-white/10 active:scale-[0.99]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-100 transition group-hover:bg-white/15 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{item.label}</p>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-blue-100">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-2 flex min-h-14 items-center gap-4 rounded-3xl bg-white/5 px-4 py-4 text-left text-sm font-black text-blue-50 ring-1 ring-white/10 transition hover:bg-red-500/15 hover:text-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <LogOut className="h-5 w-5" />
              </div>

              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </nav>
        </section>
      </div>
    </main>
  );
}
