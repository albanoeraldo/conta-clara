"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  Landmark,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Tags,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

type AppLayoutProps = {
  children: ReactNode;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: BarChart3,
  },
  {
    href: "/lancamentos",
    label: "Lançamentos",
    icon: ListChecks,
  },
  {
    href: "/parcelamentos",
    label: "Parcelamentos",
    icon: Landmark,
  },
  {
    href: "/cartoes",
    label: "Cartões",
    icon: CreditCard,
  },
  {
    href: "/contas-fixas",
    label: "Contas fixas",
    icon: CalendarClock,
  },
  {
    href: "/categorias",
    label: "Categorias",
    icon: Tags,
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: UserRound,
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings,
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isMenuPage = pathname === "/menu";

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const user = await getCurrentUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        router.replace("/login");
        return;
      }

      setIsCheckingSession(false);
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    await supabase.auth.signOut();

    router.replace("/login");
  }

  function isNavigationItemActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const currentNavigationItem = navigationItems.find((item) =>
    isNavigationItemActive(item.href),
  );

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-950 sm:px-6">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mb-6 flex justify-center">
            <Logo href="/dashboard" variant="internal" />
          </div>

          <p className="mb-3 text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            Conta Clara
          </p>

          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Verificando acesso...
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Aguarde enquanto confirmamos sua sessão.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-[#0F2A5F] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10">
          <Logo href="/dashboard" variant="sidebar" />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                  isActive
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-blue-600" : "text-blue-100"
                  }`}
                />

                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-blue-100 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      {!isMenuPage && (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Logo href="/dashboard" variant="internal" />
            </div>

            <Link
              href="/menu"
              aria-label="Abrir menu"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Menu className="h-5 w-5" />
              Menu
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                Você está em
              </p>

              <p className="mt-1 truncate text-sm font-black text-slate-800">
                {currentNavigationItem?.label ?? "Conta Clara"}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
              Beta
            </span>
          </div>
        </header>
      )}

      <main
        className={
          isMenuPage
            ? "min-h-screen bg-[#0F2A5F] px-0 py-0 lg:bg-slate-100 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-80"
            : "min-h-screen bg-slate-100 px-4 pt-5 pb-24 sm:px-6 sm:py-8 lg:pr-8 lg:pb-8 lg:pl-80"
        }
      >
        {children}
      </main>
    </div>
  );
}
