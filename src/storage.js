import { useEffect, useState } from "react";

export function useSessionState(key, initial, parse) {
  const [value, setValue] = useState(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return initial;
      return parse(JSON.parse(raw));
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
