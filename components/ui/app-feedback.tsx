import { AlertCircle, CheckCircle2 } from "lucide-react";

type AppFeedbackType = "success" | "error";

type AppFeedbackProps = {
  type: AppFeedbackType;
  message: string;
  className?: string;
};

const feedbackStyles: Record<
  AppFeedbackType,
  {
    wrapper: string;
    icon: string;
  }
> = {
  success: {
    wrapper: "bg-emerald-400/10 text-emerald-300",
    icon: "text-emerald-300",
  },
  error: {
    wrapper: "bg-red-400/10 text-red-300",
    icon: "text-red-300",
  },
};

export function AppFeedback({
  type,
  message,
  className = "",
}: AppFeedbackProps) {
  const styles = feedbackStyles[type];
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${styles.wrapper} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />

      <p className="leading-6">{message}</p>
    </div>
  );
}
