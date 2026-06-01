"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

type AppLayoutProps = {
  children: ReactNode;
};

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/lancamentos",
    label: "Lançamentos",
  },
  {
    href: "/categorias",
    label: "Categorias",
  },
  {
    href: "/perfil",
    label: "Perfil",
  },
  {
    href: "/configuracoes",
    label: "Configurações",
  },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    await supabase.auth.signOut();

    router.replace("/login");
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-2xl">
          <p className="mb-3 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Conta Clara
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            Verificando acesso...
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Aguarde enquanto confirmamos sua sessão.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/dashboard" className="group">
            <p className="text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
              Conta Clara
            </p>
            <p className="mt-1 text-xs text-zinc-500 group-hover:text-zinc-400">
              Controle financeiro simples
            </p>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap gap-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-400 text-zinc-950"
                        : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
