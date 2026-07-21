"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Landmark,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Receipt,
  Settings,
  Tags,
  User,
} from "lucide-react";

import { UserAvatar } from "@/components/profile/user-avatar";
import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

const menuGroups = [
  {
    title: "Dia a Dia",
    items: [
      {
        name: "Resumo",
        href: "/dashboard",
        icon: LayoutDashboard,
        highlight: false,
      },
      {
        name: "Novo Lançamento",
        href: "/lancamentos/novo",
        icon: PlusCircle,
        highlight: true,
      },
      {
        name: "Lançamentos",
        href: "/lancamentos",
        icon: Receipt,
        highlight: false,
      },
    ],
  },
  {
    title: "Gestão Financeira",
    items: [
      {
        name: "Parcelamentos",
        href: "/parcelamentos",
        icon: Landmark,
        highlight: false,
      },
      { name: "Cartões", href: "/cartoes", icon: CreditCard, highlight: false },
      {
        name: "Contas Fixas",
        href: "/contas-fixas",
        icon: CalendarDays,
        highlight: false,
      },
    ],
  },
  {
    title: "Análise & Organização",
    items: [
      {
        name: "Relatórios",
        href: "/relatorios",
        icon: BarChart3,
        highlight: false,
      },
      { name: "Categorias", href: "/categorias", icon: Tags, highlight: false },
    ],
  },
  {
    title: "Minha Conta",
    items: [
      { name: "Perfil", href: "/perfil", icon: User, highlight: false },
      {
        name: "Configurações",
        href: "/configuracoes",
        icon: Settings,
        highlight: false,
      },
      {
        name: "Sair",
        href: "#",
        icon: LogOut,
        highlight: false,
        isDestructive: true,
      },
    ],
  },
];

export default function MenuPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Usuário");
  const [userAvatarKey, setUserAvatarKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Consulta direta à tabela profiles do Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", user.id)
            .single();

          if (profile) {
            setUserName(profile.full_name || "Usuário");
            setUserAvatarKey(profile.avatar_url || null);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil no menu:", error);
      }
    }

    void loadUserProfile();
  }, []);

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao sair da conta:", error);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A1629] pt-6 pb-12">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase">
                Conta Clara
              </h1>
              <p className="text-xs text-slate-400">
                Controle financeiro simples
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black tracking-wider text-white uppercase">
            Beta
          </span>
        </div>

        {/* Card do Usuário Dinâmico */}
        <div className="mb-8 flex items-center gap-4 rounded-3xl bg-[#122343] p-5 shadow-lg">
          <UserAvatar
            avatarKey={userAvatarKey}
            name={userName}
            className="h-16 w-16 border-2 border-blue-500"
          />
          <div>
            <h2 className="text-xl font-black text-white">Olá, {userName}</h2>
            <p className="mt-1 text-sm text-slate-400">
              Escolha uma área para continuar.
            </p>
          </div>
        </div>

        {/* Grupos do Menu */}
        <div className="space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 ml-2 text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                {group.title}
              </h3>

              <div className="overflow-hidden rounded-3xl bg-[#122343] shadow-sm">
                <ul className="divide-y divide-white/5">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    if (item.name === "Sair") {
                      return (
                        <li key={item.name}>
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-white/5 active:bg-white/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className="font-semibold text-red-400">
                                {item.name}
                              </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-600" />
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between p-4 transition-colors hover:bg-white/5 active:bg-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                item.highlight
                                  ? "bg-blue-500 text-white"
                                  : "bg-white/5 text-blue-400"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-semibold text-slate-200">
                              {item.name}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-600" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
