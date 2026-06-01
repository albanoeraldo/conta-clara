"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getUserFinancialSpaceId } from "@/lib/auth/financial-space";
import { getCurrentUser } from "@/lib/auth/session";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const user = await getCurrentUser();

      if (!isMounted) {
        return;
      }

      if (!user) {
        setIsCheckingSession(false);
        return;
      }

      const financialSpaceId = await getUserFinancialSpaceId(user.id);

      if (financialSpaceId) {
        router.replace("/dashboard");
        return;
      }

      router.replace("/onboarding");
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 text-center shadow-2xl">
          <p className="mb-3 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Conta Clara
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            Verificando sessão...
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Aguarde enquanto verificamos seu acesso.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
