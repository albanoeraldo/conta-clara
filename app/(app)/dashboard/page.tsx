export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
              Conta Clara
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard do mês
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Acompanhe suas contas, gastos e saldo previsto de forma simples.
            </p>
          </div>

          <button className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300">
            Novo lançamento
          </button>
        </header>

        <section className="mb-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-300">
                Saúde do mês
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Seu mês ainda está zerado
              </h2>

              <p className="mt-2 text-sm text-emerald-100/80">
                Cadastre suas primeiras receitas e despesas para o Conta Clara
                mostrar como está sua situação financeira.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-950/50 px-5 py-4 text-center">
              <p className="text-xs tracking-[0.2em] text-zinc-400 uppercase">
                Status
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-300">
                Aguardando dados
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
            <p className="text-sm text-zinc-400">Receitas do mês</p>
            <strong className="mt-3 block text-2xl font-bold text-emerald-300">
              R$ 0,00
            </strong>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
            <p className="text-sm text-zinc-400">Despesas do mês</p>
            <strong className="mt-3 block text-2xl font-bold text-red-300">
              R$ 0,00
            </strong>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
            <p className="text-sm text-zinc-400">Saldo previsto</p>
            <strong className="mt-3 block text-2xl font-bold text-white">
              R$ 0,00
            </strong>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
            <p className="text-sm text-zinc-400">Contas pendentes</p>
            <strong className="mt-3 block text-2xl font-bold text-yellow-300">
              0
            </strong>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Últimos lançamentos</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Os lançamentos mais recentes aparecerão aqui.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
                <p className="text-sm text-zinc-400">
                  Nenhum lançamento cadastrado ainda.
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Comece adicionando sua primeira receita ou despesa.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Receitas x despesas</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Em breve, este espaço mostrará a comparação do mês em gráfico.
                </p>
              </div>

              <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-zinc-700">
                <p className="text-sm text-zinc-500">
                  Gráfico será exibido quando houver lançamentos.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
              <h2 className="text-xl font-semibold">Próximas contas</h2>

              <div className="mt-5 rounded-2xl border border-dashed border-zinc-700 p-6 text-center">
                <p className="text-sm text-zinc-400">
                  Nenhuma conta próxima do vencimento.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
              <h2 className="text-xl font-semibold">Resumo rápido</h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-sm text-zinc-400">Mês atual</span>
                  <strong className="text-sm">Maio/2026</strong>
                </div>

                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="text-sm text-zinc-400">Status</span>
                  <strong className="text-sm text-emerald-300">
                    Aguardando dados
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Plano</span>
                  <strong className="text-sm text-emerald-300">
                    Teste grátis
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
              <h2 className="text-xl font-semibold">Próximos passos</h2>

              <ul className="mt-5 space-y-3 text-sm text-zinc-400">
                <li>• Cadastrar primeira receita</li>
                <li>• Cadastrar primeira despesa</li>
                <li>• Organizar categorias</li>
                <li>• Acompanhar saldo do mês</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
