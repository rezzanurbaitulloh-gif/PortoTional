import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "auto",
}: {
  className?: string;
  /** "auto" follows the active theme; "dark"/"light" force a mark. */
  variant?: "auto" | "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dark.png"
        alt=""
        aria-hidden
        className={cn(
          "h-7 w-auto",
          variant === "light" ? "hidden" : "block light:hidden",
        )}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-light.png"
        alt="PortoTional"
        className={cn(
          "h-7 w-auto",
          variant === "dark" ? "hidden" : "hidden light:block",
        )}
      />
      <span className="text-lg font-semibold tracking-tight text-ivory">
        Porto<span className="text-gold">Tional</span>
      </span>
    </span>
  );
}
