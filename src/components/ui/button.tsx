import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display uppercase tracking-[0.12em] font-medium select-none disabled:opacity-40 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-sun/80 focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:not-disabled:scale-[0.96] transition-[scale,background-color,color,opacity] duration-150 ease-out",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-accent)_70%,black)] hover:bg-[#e21830]",
        navy: "bg-navy text-fg hover:bg-navy-bright",
        sun: "bg-sun text-sun-fg hover:bg-[#ffe15a]",
        ghost:
          "bg-elevated text-fg shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-surface",
        outline:
          "bg-transparent text-fg shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-elevated",
        danger:
          "bg-transparent text-accent shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-accent)_50%,transparent)] hover:bg-accent/10",
      },
      size: {
        sm: "h-10 px-3.5 text-[15px] rounded-[8px]",
        md: "h-12 px-4 text-[17px] rounded-[10px]",
        lg: "h-14 px-5 text-[19px] rounded-[12px]",
        icon: "size-12 rounded-[10px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
