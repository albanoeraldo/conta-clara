type SummaryCardTone = "emerald" | "red" | "yellow" | "zinc";

type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
  tone: SummaryCardTone;
};

const toneStyles: Record<
  SummaryCardTone,
  {
    border: string;
    background: string;
    label: string;
    value: string;
  }
> = {
  emerald: {
    border: "border-emerald-400/20",
    background: "bg-emerald-400/5",
    label: "text-emerald-300",
    value: "text-emerald-300",
  },
  red: {
    border: "border-red-400/20",
    background: "bg-red-400/5",
    label: "text-red-300",
    value: "text-red-300",
  },
  yellow: {
    border: "border-yellow-400/20",
    background: "bg-yellow-400/5",
    label: "text-yellow-300",
    value: "text-yellow-300",
  },
  zinc: {
    border: "border-zinc-800",
    background: "bg-zinc-900/70",
    label: "text-zinc-300",
    value: "text-white",
  },
};

export function SummaryCard({
  title,
  value,
  description,
  tone,
}: SummaryCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-3xl border ${styles.border} ${styles.background} p-4 shadow-xl sm:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm font-medium ${styles.label}`}>{title}</p>

          <strong
            className={`mt-3 block text-2xl font-bold sm:text-3xl ${styles.value}`}
          >
            {value}
          </strong>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/70">
          <span
            className={`h-2.5 w-2.5 rounded-full ${styles.value} bg-current`}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}
