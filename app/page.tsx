import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Sparkles,
  WalletCards,
} from "lucide-react";

const features = [
  {
    title: "Dashboard simples",
    description:
      "Veja receitas, despesas, saldo previsto e contas pendentes em um só lugar.",
    icon: BarChart3,
  },
  {
    title: "Lançamentos organizados",
    description:
      "Cadastre contas, gastos, receitas, categorias, status e forma de pagamento.",
    icon: WalletCards,
  },
  {
    title: "Controle sem planilha",
    description:
      "Uma experiência mais fácil para quem não quer depender de planilhas complexas.",
    icon: CreditCard,
  },
  {
    title: "Dados protegidos",
    description:
      "Cada usuário acessa somente suas próprias informações financeiras.",
    icon: LockKeyhole,
  },
];

const benefits = [
  "Controle financeiro simples para o dia a dia",
  "Ideal para pessoas comuns e casais",
  "Resumo mensal com gráfico",
  "Categorias personalizadas",
  "Visual limpo e fácil de entender",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-32 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-sm font-black text-white shadow-lg shadow-blue-950/40">
                CC
              </div>

              <div>
                <p className="text-sm font-semibold tracking-[0.28em] text-blue-300 uppercase">
                  Conta Clara
                </p>
                <p className="mt-1 hidden text-xs text-zinc-500 sm:block">
                  Simples, limpo e confiável
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
              >
                Entrar
              </Link>

              <Link
                href="/cadastro"
                className="hidden rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 sm:inline-flex"
              >
                Criar conta
              </Link>
            </nav>
          </header>

          <div className="grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200">
                <Sparkles className="h-4 w-4" />
                Primeira versão funcional online
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Um controle financeiro simples para quem quer parar de se perder
                nas contas.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                Organize receitas, despesas, categorias, contas pendentes e
                saldo previsto em uma interface clara, sem depender de planilhas
                complicadas.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
                >
                  Começar teste grátis
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/70 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  Já tenho conta
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-300" />
                    <span className="text-sm text-zinc-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-4xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-2xl shadow-blue-950/20">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Dashboard do mês</p>
                    <h2 className="mt-1 text-2xl font-bold">Junho/2026</h2>
                  </div>

                  <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                    Em equilíbrio
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                    <p className="text-sm text-blue-200">Receitas</p>
                    <strong className="mt-3 block text-2xl">R$ 3.500,00</strong>
                  </div>

                  <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                    <p className="text-sm text-red-200">Despesas</p>
                    <strong className="mt-3 block text-2xl">R$ 1.240,00</strong>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-400">Saldo previsto</p>
                    <strong className="mt-3 block text-2xl text-blue-300">
                      R$ 2.260,00
                    </strong>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                    <p className="text-sm text-yellow-200">Pendentes</p>
                    <strong className="mt-3 block text-2xl">3</strong>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Próximas contas</p>
                    <p className="text-xs text-zinc-500">Exemplo</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-zinc-950 px-4 py-3">
                      <span className="text-sm text-zinc-300">Internet</span>
                      <strong className="text-sm text-red-300">
                        R$ 120,00
                      </strong>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-zinc-950 px-4 py-3">
                      <span className="text-sm text-zinc-300">Mercado</span>
                      <strong className="text-sm text-red-300">
                        R$ 350,00
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-4 pb-16 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mb-12 rounded-4xl border border-zinc-800 bg-zinc-900/70 p-6 text-center shadow-xl sm:p-10">
            <p className="text-sm font-medium tracking-[0.3em] text-blue-300 uppercase">
              Conta Clara
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Menos confusão, mais clareza para cuidar do seu dinheiro.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              O Conta Clara foi pensado para facilitar o controle financeiro do
              mês, com uma experiência simples, direta e amigável.
            </p>

            <div className="mt-8">
              <Link
                href="/cadastro"
                className="inline-flex rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              >
                Criar minha conta
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
