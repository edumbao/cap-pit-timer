import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[10px] bg-bg px-3.5 text-base text-fg",
        "shadow-[inset_0_0_0_1px_var(--color-border)]",
        "placeholder:text-subtle outline-none",
        "focus-visible:shadow-[inset_0_0_0_1px_var(--color-sun),0_0_0_3px_color-mix(in_oklab,var(--color-sun)_25%,transparent)]",
        "transition-[box-shadow] duration-150 ease-out",
        className,
      )}
      {...props}
    />
  );
}
