import { LoaderCircle } from "lucide-react";

type AppLoadingStateProps = {
  message: string;
};

export function AppLoadingState({ message }: AppLoadingStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 p-6 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
        <LoaderCircle className="h-6 w-6 animate-spin" />
      </div>

      <p className="text-sm text-zinc-400">{message}</p>
    </div>
  );
}
