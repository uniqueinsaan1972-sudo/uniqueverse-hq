import { readMedia } from "@/lib/store";

const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

export async function GET(_: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  if (!/^[a-f0-9]{16}$/.test(id) || !/^[a-f0-9]{12}\.(png|jpg|webp|gif)$/.test(file)) return new Response("Not found", { status: 404 });
  const data = await readMedia(id, file);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: { "Content-Type": TYPES[file.split(".")[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
  });
}
