import Image from "next/image";
import Link from "next/link";

type LogoVariant = "internal" | "full" | "symbol";
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
