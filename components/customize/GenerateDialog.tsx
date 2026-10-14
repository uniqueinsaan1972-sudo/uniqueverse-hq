"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/lib/ui";

const STEPS = ["Preparing content", "Applying customization", "Processing images", "Creating your personal page", "Generating QR code"];

export default function GenerateDialog({ open, step, error, onRetry, onClose }: { open: boolean; step: number; error: string; onRetry: () => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Generating your website">
          <motion.div initial={{ y: 16, scale: 0.97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            {error ? (
              <div className="text-center">
                <TriangleAlert className="mx-auto text-red-600" size={32} />
                <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
                <p className="mt-2 text-sm text-[#6B6B6B]">{error}</p>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={onClose} className={`${btnSecondary} flex-1`}>Back to editor</button>
                  <button type="button" onClick={onRetry} className={`${btnPrimary} flex-1`}>Try again</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{step >= STEPS.length ? "Done!" : "Generating your website..."}</h2>
                <ul className="mt-6 space-y-4">
                  {STEPS.map((s, i) => (
                    <li key={s} className={`flex items-center gap-3 text-[15px] transition ${i <= step ? "text-[#111111]" : "text-[#9a9aa2]"}`}>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i < step ? "bg-[#111111] text-white" : "border border-[#D9D9DE]"}`}>
                        {i < step ? <Check size={14} strokeWidth={3} /> : i === step ? <Loader2 size={14} className="animate-spin" /> : null}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
