import { cn } from "@/lib/utils";

interface TimeInput24hProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput24h({ value, onChange, className }: TimeInput24hProps) {
  const [hours, minutes] = value ? value.split(':') : ['', ''];

  const handleHours = (h: string) => {
    const num = Math.min(23, Math.max(0, Number(h)));
    const hh = String(num).padStart(2, '0');
    onChange(`${hh}:${minutes || '00'}`);
  };

  const handleMinutes = (m: string) => {
    const num = Math.min(59, Math.max(0, Number(m)));
    const mm = String(num).padStart(2, '0');
    onChange(`${hours || '00'}:${mm}`);
  };

  const inputClass =
    "w-14 text-center h-10 rounded-md border border-input bg-background px-2 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm";

  return (
    <div className={cn("flex items-center gap-1", className)} dir="ltr">
      <input
        type="number"
        min={0}
        max={23}
        value={hours}
        onChange={(e) => handleHours(e.target.value)}
        placeholder="HH"
        className={inputClass}
      />
      <span className="text-lg font-medium text-muted-foreground">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={minutes}
        onChange={(e) => handleMinutes(e.target.value)}
        placeholder="MM"
        className={inputClass}
      />
    </div>
  );
}
