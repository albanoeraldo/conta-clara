import Link from "next/link";

type LogoProps = {
  href?: string;
  showSubtitle?: boolean;
};

export function Logo({ href = "/dashboard", showSubtitle = true }: LogoProps) {
  const content = (
    <div className="group flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-950/30 transition group-hover:bg-emerald-300">
        CC
      </div>

      <div>
        <p className="text-sm font-semibold tracking-[0.28em] text-emerald-400 uppercase">
          Conta Clara
        </p>

        {showSubtitle && (
          <p className="mt-1 text-xs text-zinc-500 transition group-hover:text-zinc-400">
            Simples, limpo e confiável
          </p>
        )}
      </div>
    </div>
  );

  return <Link href={href}>{content}</Link>;
}
