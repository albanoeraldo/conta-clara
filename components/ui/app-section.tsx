import type { ReactNode } from "react";

type AppSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function AppSection({
  title,
  description,
  children,
  action,
  className = "",
}: AppSectionProps) {
  return (
    <section
      className={`rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl ${className}`}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h2 className="text-xl font-semibold">{title}</h2>}

            {description && (
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {description}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {children}
    </section>
  );
}
