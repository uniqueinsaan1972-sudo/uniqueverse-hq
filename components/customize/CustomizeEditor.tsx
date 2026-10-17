"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Template } from "@/types/template";
import type { ContentConfig, ImageValue, NamesValue, TemplateContent } from "@/types/content";
import { cloneContent, fileToImage, slotName } from "@/lib/content";
import TemplatePreview from "@/components/TemplatePreview";
import TemplateFrame from "@/components/TemplateFrame";
import { AddImageButton, ImageCard, Section, TextArea, TextInput, Toggle } from "./Controls";
import { container } from "@/lib/ui";
import { ApiError, fetchOwned, publishWebsite } from "@/lib/client";
import { usePrice } from "@/lib/config-client";
import GenerateDialog from "./GenerateDialog";

export default function CustomizeEditor({ template, config }: { template: Template; config: ContentConfig }) {
  const { fields } = config;
  const [content, setContent] = useState<TemplateContent>(() => cloneContent(config.defaults));
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [gen, setGen] = useState<{ open: boolean; step: number; error: string; action: { label: string; href: string } | null }>({ open: false, step: 0, error: "", action: null });
  const [acct, setAcct] = useState<{ loggedIn: boolean; balance: number } | null>(null);
  const router = useRouter();
  const editParam = useSearchParams().get("edit") ?? "";
  const editId = /^[a-f0-9]{16}$/.test(editParam) ? editParam : "";
  const price = usePrice(template.id);
  const storageKey = `uv:draft:${template.id}:${editId || "new"}`;
  const loginHref = `/login?next=${encodeURIComponent(`/customize/${template.id}${editId ? `?edit=${editId}` : ""}`)}`;
  const gal = config.gallery ?? { min: 0, max: 12 };

  // restore this device's draft (the original template defaults are never modified)
  useEffect(() => {
    let off = false;
    const t = setTimeout(() => {
      if (editId) {
        // editing: start from what is saved on the server
        fetchOwned(editId).then((r) => { if (!off) setContent(r.website.data); }).catch(() => { if (!off) setError("We could not load that website. Please open it again from your account."); }).finally(() => { if (!off) setReady(true); });
        return;
      }
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) setContent(JSON.parse(raw));
      } catch { /* ignore broken drafts */ }
      setReady(true);
    }, 0);
    return () => { off = true; clearTimeout(t); };
  }, [storageKey, editId]);

  useEffect(() => {
    fetch("/api/account/balance", { cache: "no-store" }).then((r) => r.json()).then(setAcct).catch(() => setAcct(null));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, JSON.stringify(content)); } catch { /* storage full: draft just isn't kept */ }
  }, [content, ready, storageKey]);

  const patchNames = (p: Partial<NamesValue>) => setContent((c) => ({ ...c, names: { ...c.names, ...p } }));
  const setSlot = (id: string, v: string) => setContent((c) => ({ ...c, names: { ...c.names, slots: { ...c.names.slots, [id]: v } } }));
  const toggleEverywhere = (on: boolean) =>
    setContent((c) => ({
      ...c,
      names: {
        ...c.names,
        useEverywhere: on,
        slots: on ? c.names.slots : Object.fromEntries(config.nameSlots.map((s) => [s.id, c.names.slots[s.id] ?? c.names.main])),
      },
    }));

  const pick = async (file: File, apply: (img: ImageValue) => void) => {
    try { setError(""); apply(await fileToImage(file)); } catch (e) { setError(e instanceof Error ? e.message : "Could not use this image."); }
  };
  const setGallery = (fn: (g: ImageValue[]) => ImageValue[]) => setContent((c) => ({ ...c, gallery: fn(c.gallery) }));
  const move = (i: number, d: number) =>
    setGallery((g) => { const n = [...g]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });

  const reset = () => {
    if (window.confirm("Reset everything to the template's original content? Your changes will be lost.")) {
      setContent(cloneContent(config.defaults));
      setError("");
    }
  };

  const generate = async () => {
    if (fields.names && !content.names.main.trim()) return setError("Please enter a main name before generating.");
    if (fields.wish && !content.wish.trim()) return setError("Please write a message before generating.");
    setError("");
    if (!editId && acct && !acct.loggedIn) { router.push(loginHref); return; }
    setGen({ open: true, step: 0, error: "", action: null });
    const tick = setInterval(() => setGen((g) => (g.step < 4 ? { ...g, step: g.step + 1 } : g)), 600);
    try {
      const [res] = await Promise.all([publishWebsite(template.id, content, editId || undefined), new Promise((r) => setTimeout(r, 2600))]);
      clearInterval(tick);
      setGen({ open: true, step: 5, error: "", action: null });
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      setTimeout(() => router.push(`/website/${res.website.id}?done=${res.updated ? "updated" : "new"}`), 700);
    } catch (e) {
      clearInterval(tick);
      const code = e instanceof ApiError ? e.code : undefined;
      setGen({
        open: true, step: 0,
        error: e instanceof Error ? e.message : "Your website could not be generated. Your customization is safe. Try again.",
        action: code === "tokens" ? { label: "Top up tokens", href: "/topup" } : code === "login" ? { label: "Sign in", href: loginHref } : null,
      });
    }
  };

  // themed (older) templates: draw the preview from the same content
  const mainDefault = config.defaults.names.main;
  const themed: Template = {
    ...template,
    previewTitle: fields.names ? template.previewTitle.replace(mainDefault, slotName(content, config.nameSlots[0].id)) : template.previewTitle,
    previewSubtitle: content.wish,
  };

  return (
    <main className={`${container} py-8 sm:py-12`}>
      <Link href={`/templates/${template.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#6B6B6B] transition hover:text-[#111111]">
        <ArrowLeft size={16} /> Back to preview
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Customize {template.name}</h1>
      <p className="mt-2 max-w-xl text-[#6B6B6B]">Everything from the preview is already filled in. Change what you like; the preview updates as you type.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        <div className="order-2 space-y-5 lg:order-1">
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {fields.names && (
            <Section title="Names" hint="Optional. Use any name you like, or keep the demo one.">
              <TextInput label="Main name" value={content.names.main} onChange={(v) => patchNames({ main: v })} />
              <Toggle label="Use this name everywhere" checked={content.names.useEverywhere} onChange={toggleEverywhere} />
              {!content.names.useEverywhere && (
                <div className="space-y-4 rounded-xl bg-[#F7F7F8] p-4">
                  <p className="text-sm font-medium text-[#6B6B6B]">Customize names individually</p>
                  {config.nameSlots.map((s) => (
                    <TextInput key={s.id} label={s.label} value={content.names.slots[s.id] ?? ""} onChange={(v) => setSlot(s.id, v)} />
                  ))}
                </div>
              )}
              {fields.nickname && <TextInput label="Nickname" value={content.names.nickname} onChange={(v) => patchNames({ nickname: v })} />}
              {fields.sender && <TextInput label="Sender name" value={content.names.sender} onChange={(v) => patchNames({ sender: v })} />}
            </Section>
          )}

          {fields.wish && (
            <Section title={config.wishLabel ?? "Message"} hint="Starts with the exact text from the preview.">
              <TextArea label={config.wishLabel ?? "Message"} value={content.wish} onChange={(v) => setContent((c) => ({ ...c, wish: v }))} />
            </Section>
          )}

          {fields.image && (
            <Section title="Main image" hint="Optional. You never have to upload a personal photo.">
              {content.image ? (
                <ImageCard image={content.image} onPick={(f) => pick(f, (img) => setContent((c) => ({ ...c, image: img })))} onRemove={() => setContent((c) => ({ ...c, image: null }))} />
              ) : (
                <AddImageButton label="Add main image" onPick={(f) => pick(f, (img) => setContent((c) => ({ ...c, image: img })))} />
              )}
            </Section>
          )}

          {fields.gallery && (
            <Section title="Gallery" hint={`${content.gallery.length} of ${gal.max} images. Replace any photo with your own, or keep the demo ones.`}>
              <div className="grid gap-3 sm:grid-cols-2">
                {content.gallery.map((g, i) => (
                  <ImageCard
                    key={`${i}-${g.name}`}
                    image={g}
                    onPick={(f) => pick(f, (img) => setGallery((list) => list.map((x, j) => (j === i ? img : x))))}
                    onRemove={content.gallery.length > gal.min ? () => setGallery((list) => list.filter((_, j) => j !== i)) : undefined}
                    onMove={{ left: i > 0 ? () => move(i, -1) : undefined, right: i < content.gallery.length - 1 ? () => move(i, 1) : undefined }}
                  />
                ))}
                {content.gallery.length < gal.max && (
                  <AddImageButton onPick={(f) => pick(f, (img) => setGallery((list) => [...list, img]))} />
                )}
              </div>
            </Section>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#D9D9DE] px-6 text-[15px] font-semibold transition hover:border-[#111111]">
              <RotateCcw size={16} /> Reset to Template Defaults
            </button>
            <button type="button" onClick={generate} disabled={!template.previewUrl || gen.open} title={template.previewUrl ? undefined : "Demo templates can't be published"} className="inline-flex h-12 items-center justify-center rounded-full bg-[#111111] px-7 text-[15px] font-semibold text-white transition hover:bg-[#2a2a2a] disabled:pointer-events-none disabled:opacity-40">
              {editId ? "Save changes" : price > 0 ? `Generate website (${price} tokens)` : "Generate website (free)"}
            </button>
          </div>
          {!editId && template.previewUrl && (
            <p className="text-sm text-[#3a3a3f]">
              {price > 0 ? <>This website costs <strong>{price} tokens</strong>. </> : <>This template is <strong>free</strong>. </>}
              {acct?.loggedIn
                ? <>You have <strong>{acct.balance}</strong> tokens.{price > 0 && acct.balance < price && <> <Link href="/topup" className="font-semibold underline">Top up tokens</Link></>}</>
                : acct && <><Link href={loginHref} className="font-semibold underline">Sign in or create a free account</Link> to generate.</>}
            </p>
          )}
          <p className="text-xs text-[#6B6B6B]">{editId ? "You are editing a website you already made. Saving it is free." : "Your changes are kept as a draft on this device."}</p>
        </div>

        <div className="order-1 lg:sticky lg:top-24 lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-[#E7E7EA] bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-1.5 border-b border-[#E7E7EA] bg-[#F7F7F8] px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#D9D9DE]" />
              <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[11px] text-[#6B6B6B]">Live preview</span>
            </div>
            {template.previewUrl ? (
              <TemplateFrame src={template.previewUrl} title={`${template.name} live preview`} content={content} nameSlots={config.nameSlots} className="h-[460px] w-full border-0 lg:h-[68vh]" />
            ) : (
              <TemplatePreview template={themed} className="aspect-[4/3]" />
            )}
          </div>
        </div>
      </div>
      <GenerateDialog open={gen.open} step={gen.step} error={gen.error} onRetry={generate} action={gen.action} onClose={() => setGen({ open: false, step: 0, error: "", action: null })} />
    </main>
  );
}
