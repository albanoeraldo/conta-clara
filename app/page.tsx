import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
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
  "Você esquece contas e vencimentos?",
  "Não sabe quanto vai sobrar no fim do mês?",
  "Se perde com compras no cartão?",
  "Tem contas fixas e parcelamentos espalhados?",
  "Já tentou usar planilha, mas achou difícil manter atualizada?",
];

const features = [
  {
    title: "Lançamentos do mês",
    description:
      "Cadastre receitas e despesas para entender o que entrou, o que saiu e quanto ainda pode sobrar.",
    icon: CircleDollarSign,
  },
  {
    title: "Contas fixas",
    description:
      "Organize aluguel, internet, energia, academia e outras contas que aparecem todos os meses.",
    icon: CalendarCheck,
  },
  {
    title: "Cartão de crédito",
    description:
      "Acompanhe compras no cartão e veja a fatura antes dela virar uma surpresa no fim do mês.",
    icon: CreditCard,
  },
  {
    title: "Parcelamentos",
    description:
      "Controle financiamentos, empréstimos e compras parceladas sem precisar lembrar tudo de cabeça.",
    icon: ClipboardList,
  },
  {
    title: "Relatórios simples",
    description:
      "Veja onde o dinheiro está indo, quais categorias pesaram mais e quais foram as maiores despesas.",
    icon: BarChart3,
  },
  {
    title: "Fechamento mensal",
    description:
      "Feche o mês e salve um resumo com receitas, despesas, saldo e principais gastos do período.",
    icon: WalletCards,
  },
];

const steps = [
  {
    title: "Cadastre suas contas",
    description:
      "Adicione receitas, despesas, vencimentos, cartões e parcelamentos do mês.",
    icon: ClipboardList,
  },
  {
    title: "Acompanhe o mês",
    description:
      "Veja o que já foi pago, o que ainda está pendente e quanto pode sobrar.",
    icon: CalendarCheck,
  },
  {
    title: "Entenda seus gastos",
    description:
      "Use relatórios simples para descobrir onde o dinheiro está indo.",
    icon: BarChart3,
  },
];

const benefits = [
  "Sem planilha complicada",
  "Feito para pessoas comuns",
  "Bom para organizar contas sozinho ou em casal",
  "Ajuda a enxergar o mês com mais clareza",
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

        <div className="absolute inset-0 bg-linear-to-r from-blue-950/95 via-blue-800/75 to-blue-400/25" />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-white/10" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Logo href="/" variant="landing" className="w-full sm:w-auto" />

            <nav className="flex w-full items-center gap-2 sm:w-auto">
              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/10 hover:text-white sm:flex-none"
              >
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 sm:flex-none"
              >
                Começar grátis
              </Link>
            </nav>
          </header>

          <div className="grid min-h-155 items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
            <div>
              <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Controle financeiro simples para o dia a dia</span>
              </div>

              <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Pare de se perder nas contas do mês.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-blue-50 sm:text-lg">
                O Conta Clara ajuda você a controlar gastos, contas fixas,
                cartão de crédito, parcelamentos e fechamento do mês de forma
                simples, clara e sem planilha complicada.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Começar grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Já tenho conta
                </Link>
              </div>

              <p className="mt-5 text-sm font-semibold text-blue-50">
                Comece com 30 dias grátis. Depois, planos simples mensais ou
                anuais.
              </p>

              <div className="mt-8 grid gap-3">
                {benefits.map((item) => (
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
              <div className="w-full max-w-sm rounded-4xl border border-white/25 bg-white/90 p-5 text-slate-950 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Resumo do mês
                    </p>
                    <h2 className="mt-1 text-2xl font-black">Agosto/2026</h2>
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
                    R$ 1.113,82
                  </strong>

                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Baseado nas receitas e despesas cadastradas no mês.
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Receitas
                    </span>
                    <strong className="text-sm text-emerald-700">
                      R$ 4.900,00
                    </strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Despesas
                    </span>
                    <strong className="text-sm text-red-500">
                      R$ 3.786,18
                    </strong>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Maior gasto
                    </span>
                    <strong className="text-sm text-red-500">Mercado</strong>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-blue-50 p-4">
                  <p className="text-sm leading-6 text-blue-900">
                    Seu mês está positivo e suas maiores despesas estão
                    concentradas em poucas categorias.
                  </p>
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
            Para quem vive contas reais
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Feito para casais, famílias e para quem quer organizar melhor as
            contas do mês.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            O Conta Clara não foi feito para complicar sua vida financeira. Ele
            foi feito para ajudar você a enxergar o básico: o que entrou, o que
            saiu, o que ainda falta pagar e quanto sobrou no fim do mês.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {painPoints.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
            >
              <CheckCircle2 className="mb-4 h-6 w-6 text-blue-600" />

              <p className="text-sm leading-6 font-bold text-slate-700">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black tracking-[0.25em] text-blue-700 uppercase">
            O que você controla
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Tudo que costuma bagunçar o mês em um só lugar.
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Controle o básico com clareza, sem precisar montar uma planilha do
            zero ou depender da memória.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
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
                A ideia é simples: cadastrar, acompanhar e entender. O Conta
                Clara mostra o mês de um jeito mais fácil de ler.
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
                Comece hoje a organizar suas contas com mais clareza.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                Teste o Conta Clara e veja como fica mais fácil entender seus
                gastos, vencimentos, cartão, parcelamentos e fechamento do mês.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        Conta Clara — controle financeiro simples para quem quer organizar
        melhor as contas do mês.
      </footer>
    </main>
  );
}
