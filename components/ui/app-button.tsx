import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type AppButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

type AppLinkButtonProps = BaseProps & {
  href: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-400 text-zinc-950 hover:bg-emerald-300 shadow-lg shadow-emerald-950/20",
  secondary:
    "border border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800 hover:text-white",
  danger:
    "border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20",
  ghost: "text-zinc-400 hover:bg-zinc-900 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "rounded-full px-3 py-1 text-xs",
  md: "rounded-xl px-5 py-3 text-sm",
};

function getButtonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return `inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
}

export function AppButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: AppButtonProps) {
  return (
    <button
      className={getButtonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export function AppLinkButton({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
}: AppLinkButtonProps) {
  return (
    <Link
      href={href}
      className={getButtonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
