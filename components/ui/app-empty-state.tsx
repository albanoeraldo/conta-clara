import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type AppEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function AppEmptyState({
  title,
  description,
  action,
  className,
}: AppEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Inbox className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-black text-slate-950">{title}</h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
