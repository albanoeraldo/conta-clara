import type { ReactNode } from "react";

type AppSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAside?: ReactNode;
};

export function AppSection({
  title,
  description,
  children,
  className = "",
  headerAside,
}: AppSectionProps) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm ${className}`}
    >
      {(title || description || headerAside) && (
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            {title && (
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>

          {headerAside && <div className="lg:max-w-md">{headerAside}</div>}
        </div>
      )}

      {children}
    </section>
  );
}
