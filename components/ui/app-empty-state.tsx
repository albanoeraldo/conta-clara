import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Inbox,
  LayoutDashboard,
  ListPlus,
  SearchX,
  Sparkles,
  Tags,
} from "lucide-react";

type EmptyStateVariant =
  | "default"
  | "dashboard"
  | "transactions"
  | "categories"
  | "search";

type AppEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: EmptyStateVariant;
  eyebrow?: string;
};

const variantConfig: Record<
  EmptyStateVariant,
  {
    Icon: LucideIcon;
    iconClassName: string;
    badgeClassName: string;
    eyebrow: string;
  }
> = {
  default: {
    Icon: Inbox,
    iconClassName: "bg-blue-50 text-blue-600",
    badgeClassName: "bg-blue-50 text-blue-700",
    eyebrow: "Tudo pronto",
  },
  dashboard: {
    Icon: LayoutDashboard,
    iconClassName: "bg-blue-50 text-blue-600",
    badgeClassName: "bg-blue-50 text-blue-700",
    eyebrow: "Comece por aqui",
  },
  transactions: {
    Icon: ListPlus,
    iconClassName: "bg-emerald-50 text-emerald-600",
    badgeClassName: "bg-emerald-50 text-emerald-700",
    eyebrow: "Primeiro lançamento",
  },
  categories: {
    Icon: Tags,
    iconClassName: "bg-violet-50 text-violet-600",
    badgeClassName: "bg-violet-50 text-violet-700",
    eyebrow: "Organização",
  },
  search: {
    Icon: SearchX,
    iconClassName: "bg-amber-50 text-amber-600",
    badgeClassName: "bg-amber-50 text-amber-700",
    eyebrow: "Nada encontrado",
  },
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function AppEmptyState({
  title,
  description,
  action,
  className,
  variant = "default",
  eyebrow,
}: AppEmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm transition-all duration-200 ease-out hover:border-blue-100 hover:shadow-md",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black tracking-[0.18em] uppercase",
          config.badgeClassName,
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow ?? config.eyebrow}
      </div>

      <div
        className={cn(
          "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl",
          config.iconClassName,
        )}
      >
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="max-w-md text-xl font-black tracking-tight text-slate-950">
        {title}
      </h3>

      {description && (
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
