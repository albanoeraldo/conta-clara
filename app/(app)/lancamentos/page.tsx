import Link from "next/link";

export default function LancamentosPage() {
  return (
    <main>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium tracking-[0.3em] text-emerald-400 uppercase">
            Lançamentos
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Meus lançamentos
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Visualize e gerencie suas receitas e despesas cadastradas.
          </p>
        </div>

        <Link
          href="/lancamentos/novo"
          className="rounded-xl bg-emerald-400 px-5 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
        >
          Novo lançamento
        </Link>
      </div>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl">
        <div className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center">
          <h2 className="text-xl font-semibold">Tela em construção</h2>

          <p className="mt-3 text-sm text-zinc-400">
            Em breve, esta página mostrará todos os seus lançamentos com filtros
            por mês, tipo e status.
          </p>

          <Link
            href="/lancamentos/novo"
            className="mt-6 inline-flex rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Cadastrar lançamento
          </Link>
        </div>
      </section>
    </main>
  );
}
