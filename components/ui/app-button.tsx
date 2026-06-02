import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type BaseButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type AppButtonProps = BaseButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

type AppLinkButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md focus-visible:ring-blue-200 active:translate-y-0 active:scale-[0.99]",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md focus-visible:ring-blue-100 active:translate-y-0 active:scale-[0.99]",
  danger:
    "bg-red-50 text-red-600 hover:-translate-y-0.5 hover:bg-red-100 focus-visible:ring-red-100 active:translate-y-0 active:scale-[0.99]",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-100 active:scale-[0.99]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-4 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-black transition-all duration-200 ease-out focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function AppButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
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
  className,
  ...props
}: AppLinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
