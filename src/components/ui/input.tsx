import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-line bg-obsidian-raised px-3 py-2 text-sm text-ivory placeholder:text-muted transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:border-line-strong focus-visible:border-gold/60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
