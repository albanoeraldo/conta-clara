import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  illustrationSrc?: string;
  illustrationAlt?: string;
  visualTitle?: string;
  visualDescription?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  illustrationSrc,
  illustrationAlt = "",
  visualTitle,
  visualDescription,
}: AuthShellProps) {
  const hasVisualContent = Boolean(
    illustrationSrc || visualTitle || visualDescription,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <section
        className={`w-full overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm ${
          hasVisualContent
            ? "grid max-w-6xl lg:grid-cols-[0.95fr_1.05fr]"
            : "max-w-xl"
        }`}
      >
        <div
          className={`flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 ${
            hasVisualContent
              ? "min-h-[calc(100vh-3rem)] lg:min-h-180"
              : "min-h-155"
          }`}
        >
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center overflow-hidden rounded-2xl bg-white px-2 py-1"
                aria-label="Ir para o início"
              >
                <div className="relative h-20 w-70 sm:h-24 sm:w-82.5">
                  <Image
                    src="/brand/conta-clara-logo-horizontal.png"
                    alt="Conta Clara"
                    fill
                    priority
                    className="scale-[2.55] object-contain object-center"
                  />
                </div>
              </Link>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                {title}
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>

            {children}

            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>

        {hasVisualContent && (
          <aside className="hidden bg-blue-50 p-8 lg:flex lg:items-center lg:justify-center">
            <div className="w-full max-w-xl">
              <div className="mb-8">
                <div className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
                  Conta Clara
                </div>

                {visualTitle && (
                  <h2 className="text-4xl leading-tight font-black tracking-tight text-slate-950">
                    {visualTitle}
                  </h2>
                )}

                {visualDescription && (
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {visualDescription}
                  </p>
                )}
              </div>

              {illustrationSrc && (
                <div className="flex justify-center">
                  <Image
                    src={illustrationSrc}
                    alt={illustrationAlt}
                    width={620}
                    height={520}
                    priority
                    className="h-auto w-full max-w-lg object-contain"
                  />
                </div>
              )}
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}
