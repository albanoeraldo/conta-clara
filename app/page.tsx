import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const painPoints = [
  "Cartão, mercado, internet e contas espalhadas.",
  "Vencimentos que passam sem perceber.",
  "Dúvida se o mês vai fechar positivo.",
  "Planilhas que começam bem e depois ficam esquecidas.",
];

const features = [
  {
    title: "Veja o mês com clareza",
    description:
      "Acompanhe receitas, despesas, saldo previsto e contas pendentes em um painel simples.",
    icon: CircleDollarSign,
  },
  {
    title: "Organize vencimentos",
    description:
      "Cadastre contas do mês e veja o que ainda está pendente para pagar.",
    icon: CalendarCheck,
  },
  {
    title: "Separe por categoria",
    description:
      "Classifique mercado, casa, transporte, lazer, cartão e outras despesas.",
    icon: WalletCards,
  },
];

const steps = [
  {
    title: "Cadastre",
    description: "Adicione receitas, despesas, vencimentos e status.",
    icon: ClipboardList,
  },
  {
    title: "Organize",
    description: "Separe por categoria e entenda melhor seus gastos.",
    icon: CreditCard,
  },
  {
    title: "Acompanhe",
    description: "Veja o saldo previsto e as contas pendentes do mês.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative min-h-190 overflow-hidden">
        <Image
          src="/landing/hero-finance.png"
          alt="Organização financeira em uma mesa com tablet"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-r from-blue-950/90 via-blue-800/70 to-blue-400/25" />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-white/10" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-blue-700">
                CC
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.28em] text-white uppercase">
                  Conta Clara
                </p>
                <p className="mt-1 hidden text-xs text-blue-100 sm:block">
                  Controle financeiro simples
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Criar conta
              </Link>
            </nav>
          </header>

          <div className="grid min-h-155 items-center gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Para organizar o mês sem complicação
              </div>

              <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Pare de tentar lembrar tudo de cabeça.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-blue-50 sm:text-lg">
                Organize receitas, despesas, vencimentos, cartão e contas do mês
                em um painel simples, claro e fácil de acompanhar.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Começar teste grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Já tenho conta
                </Link>
              </div>

              <div className="mt-8 grid gap-3">
                {painPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-100" />
                    <span className="text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex lg:justify-end">
              <div className="w-full max-w-sm rounded-4xl border border-white/25 bg-white/85 p-5 text-slate-950 backdrop-blur">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Resumo do mês
                    </p>
                    <h2 className="mt-1 text-2xl font-black">Junho/2026</h2>
                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                    Exemplo
                  </span>
                </div>

                <div className="rounded-3xl bg-blue-600 p-5 text-white">
                  <p className="text-sm font-semibold text-blue-100">
                    Saldo previsto
                  </p>

                  <strong className="mt-2 block text-3xl font-black">
                    R$ 2.260,00
                  </strong>

                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Baseado nas receitas e despesas cadastradas no mês.
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Internet
                    </span>
                    <strong className="text-sm text-red-500">R$ 120,00</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Mercado
                    </span>
                    <strong className="text-sm text-red-500">R$ 350,00</strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Cartão
                    </span>
                    <strong className="text-sm text-red-500">R$ 480,00</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 z-10 h-24 w-full text-white"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,80 C240,140 480,0 720,60 C960,120 1200,20 1440,70 L1440,120 L0,120 Z"
          />
        </svg>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            Clareza no dia a dia
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Feito para quem quer entender o mês sem complicar a vida.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            O Conta Clara organiza o básico de forma visual: o que entrou, o que
            saiu, o que ainda está pendente e como está o saldo previsto.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-100 bg-white p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-black text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-4xl bg-slate-50 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
                Como funciona
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Da bagunça das contas para uma visão clara do mês.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                A ideia é simples: cadastrar, organizar e acompanhar. Sem
                planilha complicada e sem precisar lembrar tudo de cabeça.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="rounded-3xl bg-white p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="text-sm font-black text-blue-200">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-4xl bg-blue-600 p-6 text-white sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-blue-50">
                <ShieldCheck className="h-4 w-4" />
                Simples, claro e confiável
              </div>

              <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Comece pelo básico. Entenda seu mês.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                Organize suas contas em poucos minutos e acompanhe o mês com
                mais calma.
              </p>
            </div>

            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Criar minha conta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        Conta Clara — controle financeiro simples para o dia a dia.
      </footer>
    </main>
  );
}
