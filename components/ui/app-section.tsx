import type { ReactNode } from "react";

type AppSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function AppSection({
  title,
  description,
  children,
  className,
}: AppSectionProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-6">
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
      )}

      {children}
    </section>
  );
}
