import { AArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFontSize, type FontSize } from "@/components/FontSizeProvider";
import { cn } from "@/lib/utils";

const OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "קטן" },
  { value: "normal", label: "רגיל" },
  { value: "large", label: "גדול" },
  { value: "xlarge", label: "גדול מאוד" },
];

export function FontSizeSelector() {
  const { fontSize, setFontSize } = useFontSize();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full transition-smooth"
          aria-label="בחירת גודל גופן"
          title="בחירת גודל גופן"
        >
          <AArrowUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">בחירת גודל גופן</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => setFontSize(opt.value)}
            className={cn(
              "text-sm font-body cursor-pointer",
              fontSize === opt.value && "bg-primary/10 text-primary font-semibold"
            )}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
