import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

type FeedbackType = "success" | "error" | "warning" | "info";

type AppFeedbackProps = {
  type: FeedbackType;
  message: string;
  className?: string;
};

const feedbackStyles: Record<
  FeedbackType,
  {
    container: string;
    icon: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    container: "border-blue-100 bg-blue-50 text-blue-700",
    icon: "text-blue-600",
    Icon: CheckCircle2,
  },
  error: {
    container: "border-red-100 bg-red-50 text-red-600",
    icon: "text-red-500",
    Icon: AlertCircle,
  },
  warning: {
    container: "border-yellow-100 bg-yellow-50 text-yellow-700",
    icon: "text-yellow-500",
    Icon: TriangleAlert,
  },
  info: {
    container: "border-slate-200 bg-white text-slate-600",
    icon: "text-blue-600",
    Icon: Info,
  },
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function AppFeedback({ type, message, className }: AppFeedbackProps) {
  const styles = feedbackStyles[type];
  const Icon = styles.Icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm",
        styles.container,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.icon)} />
      <span>{message}</span>
    </div>
  );
}
