import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  illustrationSrc?: string;
  illustrationAlt?: string;
  visualTitle?: string;
  visualDescription?: string;
};

const benefits = [
  "Organize contas, cartão e vencimentos.",
  "Acompanhe o mês com mais clareza.",
  "Controle simples, sem planilha complicada.",
];

export function AuthShell({
  title,
  description,
  children,
  footer,
  illustrationSrc = "/brand/conta-clara-cat.png",
  illustrationAlt = "Mascote do Conta Clara organizando finanças",
  visualTitle = "Sua vida financeira em uma visão mais tranquila.",
  visualDescription = "Um jeito leve de acompanhar receitas, despesas, categorias e contas pendentes sem se perder no mês.",
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7fbff] text-slate-950">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="mx-auto w-full max-w-lg">
          <div className="rounded-4xl border border-slate-100 bg-white p-7 shadow-sm sm:p-10">
            <div className="mb-7 flex justify-center">
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
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>

            {children}

            <div className="mt-8 border-t border-slate-100 pt-6">{footer}</div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-4xl bg-blue-50 p-10">
            <div className="absolute top-8 left-8 h-48 w-48 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="absolute right-8 bottom-8 h-48 w-48 rounded-full bg-cyan-200/60 blur-3xl" />

            <div className="relative">
              <div className="mb-8 max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700">
                  <ShieldCheck className="h-4 w-4" />
                  Simples, claro e confiável
                </div>

                <h2 className="text-4xl font-black tracking-tight text-slate-950">
                  {visualTitle}
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {visualDescription}
                </p>
              </div>

              <div className="relative mx-auto max-w-xl">
                <Image
                  src={illustrationSrc}
                  alt={illustrationAlt}
                  width={900}
                  height={650}
                  priority
                  className="h-auto w-full object-contain"
                />
              </div>

              <div className="mt-8 grid gap-3">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />

                    <span className="text-sm font-semibold text-slate-700">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
