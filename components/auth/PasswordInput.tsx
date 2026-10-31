"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { input } from "@/components/admin/ui";

/** Password field with a show/hide button. */
export default function PasswordInput({
  value, onChange, placeholder, autoComplete, label, required = true,
}: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: "current-password" | "new-password"; label: string; required?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} required={required} autoComplete={autoComplete} aria-label={label} placeholder={placeholder} className={`${input} pr-12`} value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#6B6B6B] transition hover:text-[#111111]">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
