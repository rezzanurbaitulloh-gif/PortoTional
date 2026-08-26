import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  /** Surface the logo sits on: "dark" (default) uses the light-stroke mark, "light" the dark-stroke mark. */
  variant?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={variant === "light" ? "/logo-light.png" : "/logo-dark.png"}
        alt="PortoTional"
        className="h-7 w-auto"
      />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          variant === "light" ? "text-obsidian" : "text-ivory",
        )}
      >
        Porto<span className="text-gold">Tional</span>
      </span>
    </span>
  );
}
