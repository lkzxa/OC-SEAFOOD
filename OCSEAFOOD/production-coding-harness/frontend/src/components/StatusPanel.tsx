"use client";

import Link from "next/link";

interface StatusPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  primaryLabel: string;
  primaryHref?: string;
  onPrimaryAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  compact?: boolean;
  announce?: "polite" | "assertive";
}

export default function StatusPanel({
  eyebrow,
  title,
  description,
  icon,
  primaryLabel,
  primaryHref,
  onPrimaryAction,
  secondaryLabel,
  secondaryHref,
  compact = false,
  announce = "polite",
}: StatusPanelProps) {
  const primaryClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-navy-950 shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";
  const secondaryClass =
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-navy-700 bg-navy-800 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-200 transition-colors hover:border-slate-500 hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

  return (
    <section
      aria-live={announce}
      className={`mx-auto flex w-full items-center justify-center px-4 md:px-6 ${compact ? "py-10" : "min-h-[58vh] py-16"}`}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-navy-700/70 bg-navy-950 px-6 py-10 text-center shadow-2xl shadow-black/20 md:px-12 md:py-14">
        <div aria-hidden="true" className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-xl flex-col items-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400">
            <span className="material-symbols-outlined select-none text-4xl" aria-hidden="true">
              {icon}
            </span>
          </div>
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.28em] text-orange-400">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-100 md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-sm font-medium leading-7 text-slate-400 md:text-base">
            {description}
          </p>

          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            {primaryHref ? (
              <Link className={primaryClass} href={primaryHref}>
                {primaryLabel}
              </Link>
            ) : (
              <button className={`${primaryClass} cursor-pointer`} onClick={onPrimaryAction} type="button">
                <span className="material-symbols-outlined text-base" aria-hidden="true">refresh</span>
                {primaryLabel}
              </button>
            )}
            {secondaryLabel && secondaryHref ? (
              <Link className={secondaryClass} href={secondaryHref}>
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
