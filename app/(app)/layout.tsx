"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
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

  function isNavigationItemActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-zinc-950">
            C
          </div>

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
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Logo />

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <nav className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-1">
              {navigationItems.map((item) => {
                const isActive = isNavigationItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-400 text-zinc-950 shadow-sm shadow-emerald-950/30"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
              className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
