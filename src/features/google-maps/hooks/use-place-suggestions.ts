"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "@/shared/lib/debounce";
import { createPlaceSearch } from "../api/place-search";
import type { LocalViagem, PlaceSuggestion } from "../model/place";

const MINIMO_CARACTERES = 3;

export function usePlaceSuggestions() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const searchRef = useRef<ReturnType<typeof createPlaceSearch> | null>(null);
  if (!searchRef.current) searchRef.current = createPlaceSearch();

  useEffect(() => {
    if (query.length < MINIMO_CARACTERES) {
      setSuggestions([]);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    const schedule = debounce(() => {
      searchRef.current
        ?.suggest(query)
        .then((results) => {
          if (cancelled) return;
          setSuggestions(results);
          setStatus("ready");
        })
        .catch((error) => {
          if (cancelled) return;
          console.error(
            "[place-search] Falha no Google Places. Verifique a ativação da Places API (New), as restrições da chave e o faturamento.",
            error,
          );
          setSuggestions([]);
          setStatus("error");
        });
    }, 300);
    schedule();
    return () => {
      cancelled = true;
      schedule.cancel();
    };
  }, [query]);

  const search = useCallback((text: string) => setQuery(text.trim()), []);
  const clear = useCallback(() => setQuery(""), []);
  // Se os detalhes falharem, o texto escolhido ainda pode ser geocodificado.
  const select = useCallback(
    async (suggestion: PlaceSuggestion): Promise<LocalViagem> => {
      setQuery("");
      try {
        const local = await searchRef.current?.select(suggestion);
        return local ?? { texto: suggestion.texto };
      } catch (error) {
        console.error("[place-search] Falha ao obter o local.", error);
        return { texto: suggestion.texto };
      }
    },
    [],
  );

  return { suggestions, status, search, clear, select };
}
