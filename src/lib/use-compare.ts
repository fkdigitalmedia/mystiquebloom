import { useEffect, useState, useCallback } from "react";

const KEY = "mystique_compare";
const MAX = 4;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setIds(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    setIds(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const current = read();
      if (current.includes(id)) {
        persist(current.filter((x) => x !== id));
      } else if (current.length < MAX) {
        persist([...current, id]);
      }
    },
    [persist],
  );

  const clear = useCallback(() => persist([]), [persist]);
  const remove = useCallback(
    (id: string) => persist(read().filter((x) => x !== id)),
    [persist],
  );

  return { ids, toggle, clear, remove, max: MAX };
}
