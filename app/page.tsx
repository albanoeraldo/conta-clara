export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-white">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">
          Conta Clara
        </p>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Um controle financeiro simples para quem quer parar de se perder nas contas.
        </h1>

        <p className="mb-8 text-lg text-zinc-300 sm:text-xl">
          Organize suas contas, cartão, assinaturas e gastos do mês em um painel fácil de entender.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="#"
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Começar teste grátis
          </a>

          <a
            href="#"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-900"
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}