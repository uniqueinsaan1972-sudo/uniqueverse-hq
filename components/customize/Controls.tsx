"use client";
/* eslint-disable @next/next/no-img-element */
import { useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { ImageValue } from "@/types/content";
import { fileLabel } from "@/lib/content";

export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E7E7EA] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-sm text-[#6B6B6B]">{hint}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#E7E7EA] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#9a9aa2] focus:border-[#111111]";

export function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputCls} h-12`} />
    </div>
  );
}

export function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <textarea id={id} value={value} rows={7} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y py-3 leading-relaxed`} />
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-11 shrink-0 rounded-full bg-[#D9D9DE] transition peer-checked:bg-[#111111] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#111111] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      {label}
    </label>
  );
}

const actionCls =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#E7E7EA] px-3.5 text-[13px] font-semibold transition hover:border-[#111111] disabled:pointer-events-none disabled:opacity-40";

/** Thumbnail + filename + Replace / Remove. Used for the main image and each gallery image. */
export function ImageCard({
  image, onPick, onRemove, onMove,
}: {
  image: ImageValue;
  onPick: (f: File) => void;
  onRemove?: () => void;
  onMove?: { left?: () => void; right?: () => void };
}) {
  const input = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);
  return (
    <div className="rounded-2xl border border-[#E7E7EA] bg-[#F7F7F8] p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E7EA] bg-white">
          {broken ? <ImageIcon size={22} className="text-[#6B6B6B]" /> : (
            <img src={image.src} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{image.name}</p>
          <p className="mt-0.5 text-xs text-[#6B6B6B]">{fileLabel(image)}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={actionCls} onClick={() => input.current?.click()}><RefreshCw size={14} /> Replace</button>
        {onRemove && <button type="button" className={actionCls} onClick={onRemove}><Trash2 size={14} /> Remove</button>}
        {onMove?.left && <button type="button" aria-label="Move earlier" className={actionCls} onClick={onMove.left}><ChevronLeft size={16} /></button>}
        {onMove?.right && <button type="button" aria-label="Move later" className={actionCls} onClick={onMove.right}><ChevronRight size={16} /></button>}
      </div>
      <input
        ref={input} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { setBroken(false); onPick(f); } e.target.value = ""; }}
      />
    </div>
  );
}

export function AddImageButton({ onPick, label = "Add image" }: { onPick: (f: File) => void; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => input.current?.click()} className="flex min-h-[7rem] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#C9C9CF] text-sm font-semibold text-[#6B6B6B] transition hover:border-[#111111] hover:text-[#111111]">
        <Plus size={18} /> {label}
      </button>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
    </>
  );
}
