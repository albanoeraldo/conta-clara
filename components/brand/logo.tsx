import Image from "next/image";
import Link from "next/link";

type LogoVariant = "internal" | "full" | "symbol";

type LogoProps = {
  href?: string;
  variant?: LogoVariant;
  className?: string;
};

export function Logo({
  href = "/dashboard",
  variant = "internal",
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
          width={220}
          height={120}
          priority
          className="h-16 w-auto object-contain"
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
          width={52}
          height={52}
          priority
          className="h-11 w-11 object-contain"
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
        width={52}
        height={52}
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
