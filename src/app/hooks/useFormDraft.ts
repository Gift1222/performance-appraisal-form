import { useEffect, useState } from "react";

export function useFormDraft(
  formId: string,
  values: Record<string, any>,
  setters: Record<string, (v: any) => void>
) {
  const [loaded, setLoaded] = useState(false);

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
    
    // Set loaded to true. Since React batches state updates, the next render
    // will have both loaded=true and the restored state values.
    setLoaded(true);
  }, [formId]);

  // Save draft whenever values change, but only after loading is complete
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("draft_" + formId, JSON.stringify(values));
  }, [JSON.stringify(values), formId, loaded]);

  const clearDraft = () => {
    localStorage.removeItem("draft_" + formId);
    setLoaded(false);
    // Re-enable draft-saving after a delay so that if states are reset, it clears properly without immediately resaving the reset states
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  };

  return { clearDraft };
}

