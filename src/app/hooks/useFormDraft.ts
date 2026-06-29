import { useEffect, useRef } from "react";

export function useFormDraft(
  formId: string,
  values: Record<string, any>,
  setters: Record<string, (v: any) => void>
) {
  const loadedRef = useRef(false);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("draft_" + formId);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((key) => {
          if (setters[key] && parsed[key] !== undefined) {
            setters[key](parsed[key]);
          }
        });
      } catch (e) {
        console.error("Failed to parse draft for " + formId, e);
      }
    }
    
    // Use a small timeout to allow state setters to flush before enabling saving.
    const timer = setTimeout(() => {
      loadedRef.current = true;
    }, 150);

    return () => clearTimeout(timer);
  }, [formId]);

  // Save draft whenever values change, but only after loading is complete
  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem("draft_" + formId, JSON.stringify(values));
  }, [JSON.stringify(values), formId]);

  const clearDraft = () => {
    localStorage.removeItem("draft_" + formId);
    loadedRef.current = false;
    // Re-enable draft-saving after a delay so that if states are reset, it clears properly without immediately resaving the reset states
    setTimeout(() => {
      loadedRef.current = true;
    }, 150);
  };

  return { clearDraft };
}
