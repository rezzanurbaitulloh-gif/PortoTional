import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-line bg-obsidian-raised px-3 py-2 text-sm text-ivory placeholder:text-muted transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:border-line-strong focus-visible:border-gold/60",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
