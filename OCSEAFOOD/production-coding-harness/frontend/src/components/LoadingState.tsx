interface LoadingStateProps {
  label?: string;
  compact?: boolean;
}

export default function LoadingState({
  label = "Đang tải dữ liệu...",
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`flex w-full flex-col items-center justify-center gap-4 text-center text-slate-400 ${compact ? "py-10" : "min-h-[40vh] py-16"}`}
      role="status"
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined animate-spin text-4xl text-orange-500"
      >
        progress_activity
      </span>
      <span className="text-xs font-extrabold uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}
