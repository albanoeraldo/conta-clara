import Image from "next/image";
import Link from "next/link";

type LogoVariant = "internal" | "full" | "symbol" | "landing";
type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  href?: string;
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
};

const fullLogoSizes: Record<LogoSize, string> = {
  sm: "h-14",
  md: "h-18",
  lg: "h-24",
};

const symbolLogoSizes: Record<LogoSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

export function Logo({
  href = "/dashboard",
  variant = "internal",
  size = "md",
  className = "",
}: LogoProps) {
  if (variant === "landing") {
    return (
      <Link
        href={href}
        aria-label="Ir para o Conta Clara"
        className={`group inline-flex max-w-full items-center gap-3 rounded-3xl border border-white/70 bg-white/95 px-4 py-3 shadow-lg shadow-blue-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white ${className}`}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
          <Image
            src="/brand/conta-clara-symbol.png"
            alt="Conta Clara"
            width={56}
            height={56}
            priority
            className="h-10 w-10 object-contain"
          />
        </span>

        <span className="min-w-0 leading-tight">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Conta Clara
            </span>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black tracking-[0.18em] text-blue-700 uppercase">
              Beta
            </span>
          </span>

          <span className="mt-1 block text-xs font-semibold text-slate-500 sm:text-sm">
            Controle financeiro simples
          </span>
        </span>
      </Link>
    );
  }

  if (variant === "full") {
    return (
      <Link
        href={href}
        aria-label="Ir para o Conta Clara"
        className={`inline-flex items-center ${className}`}
      >
        <Image
          src="/brand/conta-clara-logo.png"
          alt="Conta Clara"
          width={360}
          height={160}
          priority
          className={`${fullLogoSizes[size]} w-auto object-contain`}
        />
      </Link>
    );
  }

  if (variant === "symbol") {
    return (
      <Link
        href={href}
        aria-label="Ir para o Conta Clara"
        className={`inline-flex items-center ${className}`}
      >
        <Image
          src="/brand/conta-clara-symbol.png"
          alt="Conta Clara"
          width={64}
          height={64}
          priority
          className={`${symbolLogoSizes[size]} object-contain`}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label="Ir para o Conta Clara"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src="/brand/conta-clara-symbol.png"
        alt="Conta Clara"
        width={56}
        height={56}
        priority
        className="h-11 w-11 object-contain"
      />

      <div className="leading-none">
        <p className="text-sm font-black tracking-[0.22em] text-blue-700 uppercase">
          Conta Clara
        </p>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Controle financeiro simples
        </p>
      </div>
    </Link>
  );
}
