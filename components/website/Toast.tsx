"use client";
import { useCallback, useRef, useState } from "react";
import { Check } from "lucide-react";

export function useToast() {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 2200);
  }, []);
  const node = (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className={`flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 ${msg ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <Check size={16} /> {msg}
      </div>
    </div>
  );
  return { show, node };
}
