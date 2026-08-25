import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-tematerang.png"
        alt="PortoTional"
        className="h-7 w-auto"
      />
      <span className="text-lg font-semibold tracking-tight text-ivory">
        Porto<span className="text-gold">Tional</span>
      </span>
    </span>
  );
}
