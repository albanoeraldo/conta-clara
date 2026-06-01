import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type AppEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function AppEmptyState({
  title,
  description,
  action,
}: AppEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
        <Inbox className="h-6 w-6" />
      </div>

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
