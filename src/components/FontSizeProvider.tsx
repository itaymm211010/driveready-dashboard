import { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "small" | "normal" | "large" | "xlarge";

type FontSizeProviderState = {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
};

const FontSizeContext = createContext<FontSizeProviderState>({
  fontSize: "normal",
  setFontSize: () => null,
});

const SCALE_MAP: Record<FontSize, number> = {
  small: 0.85,
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
};

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>(
    () => (localStorage.getItem("drivekal-font-size") as FontSize) || "normal"
  );

  useEffect(() => {
    const scale = SCALE_MAP[fontSize];
    document.documentElement.style.setProperty("--font-scale", String(scale));
    document.documentElement.style.fontSize = `${scale * 100}%`;
  }, [fontSize]);

  const value = {
    fontSize,
    setFontSize: (size: FontSize) => {
      localStorage.setItem("drivekal-font-size", size);
      setFontSize(size);
    },
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);
