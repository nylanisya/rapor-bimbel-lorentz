import { useState, useEffect } from "react";
import { A4_WIDTH_PX } from "../constants";

export function useResponsiveScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const sidePadding = 16;
      const available = window.innerWidth - sidePadding * 2;
      const next = Math.min(1, available / A4_WIDTH_PX);
      setScale(next);
    };
    calc();
    window.addEventListener("resize", calc);
    const before = () => setScale(1);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", calc);
    };
  }, []);
  return scale;
}
