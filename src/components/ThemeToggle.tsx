import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 rounded-full transition-smooth"
      aria-label={isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}
      title={isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-warning" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="sr-only">{isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}</span>
    </Button>
  );
}
