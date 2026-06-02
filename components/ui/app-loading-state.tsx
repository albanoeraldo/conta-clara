type AppLoadingStateProps = {
  message?: string;
  className?: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function AppLoadingState({
  message = "Carregando...",
  className,
}: AppLoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-32 flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white px-6 py-8 text-center shadow-sm",
        className,
      )}
    >
      <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}
