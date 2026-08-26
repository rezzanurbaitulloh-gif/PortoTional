"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Monitor, Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "pt-theme";

const ThemeContext = createContext<{
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({ mode: "system", setMode: () => {} });

function apply(mode: ThemeMode) {
  const dark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("light", !dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored =
      (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    setModeState(stored);
    apply(stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) === "system")
        apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    apply(m);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const options: { key: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { key: "light", icon: <Sun className="h-4 w-4" />, label: "Light" },
    { key: "dark", icon: <Moon className="h-4 w-4" />, label: "Dark" },
    { key: "system", icon: <Monitor className="h-4 w-4" />, label: "System" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={mode === o.key}
          title={`${o.label} theme`}
          onClick={() => setMode(o.key)}
          className={`rounded-md p-1.5 transition-colors ${
            mode === o.key
              ? "bg-gold/15 text-gold"
              : "text-muted hover:text-ivory"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
