import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display uppercase tracking-[0.14em] text-[13px] leading-none",
  {
    variants: {
      tone: {
        red: "bg-accent/15 text-accent",
        navy: "bg-navy/40 text-fg",
        sun: "bg-sun/15 text-sun",
        mute: "bg-elevated text-muted",
        ok: "bg-ok/15 text-ok",
        live: "bg-accent text-accent-fg",
      },
    },
    defaultVariants: { tone: "mute" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
