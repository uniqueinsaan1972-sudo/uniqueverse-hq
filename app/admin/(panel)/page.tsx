"use client";
import Link from "next/link";
import { Card, ErrorBox, Skeleton, Stat, bytes, useApi, when } from "@/components/admin/ui";

type Overview = {
  total: number; week: number; byTemplate: Record<string, number>; templatesPublished: number;
  recent: { id: string; slug: string; templateId: string; createdAt: string }[];
  usage: { storage_bytes: number; storage_files: number; db_bytes: number } | null;
};

type Health = { ok: boolean; items: { name: string; ok: boolean; detail?: string }[] };

function SetupCheck() {
  const { data, error } = useApi<Health>("/api/admin/health");
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;
  if (data.ok) return <p className="text-sm text-emerald-700">Setup check: everything the database needs is in place.</p>;
  return (
    <Card title="Setup check: something is missing">
      <p className="mb-3 text-sm text-[#3a3a3f]">Fix the red items. For missing tables, columns or functions, open Supabase &gt; SQL Editor, run <b>supabase/all-in-one.sql</b>, then reload this page.</p>
      <ul className="space-y-2 text-sm">
        {data.items.filter((i) => !i.ok).map((i) => (
          <li key={i.name} className="rounded-lg bg-red-50 px-3 py-2 text-red-700"><b>{i.name}</b>{i.detail && <span className="block break-words text-xs">{i.detail}</span>}</li>
        ))}
      </ul>
    </Card>
  );
}

export default function OverviewPage() {
  const { data, error, loading } = useApi<Overview>("/api/admin/overview");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
      <p className="mt-1 text-sm text-[#6B6B6B]">Real numbers from your database.</p>
      <div className="mt-6 space-y-5">
        <SetupCheck />
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Websites created" value={data.total} />
              <Stat label="Last 7 days" value={data.week} />
              <Stat label="Templates" value={data.templatesPublished} hint="built into the site" />
              <Stat label="Photo storage" value={data.usage ? bytes(data.usage.storage_bytes) : "n/a"} hint={data.usage ? `${data.usage.storage_files} files, limit 1 GB on Supabase free` : "Run supabase/admin.sql"} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Websites by template">
                {Object.keys(data.byTemplate).length === 0 ? <p className="text-sm text-[#6B6B6B]">No websites yet.</p> : (
                  <ul className="space-y-2 text-sm">
                    {Object.entries(data.byTemplate).sort((a, b) => b[1] - a[1]).map(([id, n]) => (
                      <li key={id} className="flex justify-between"><span>{id}</span><span className="font-semibold">{n}</span></li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="Newest websites">
                {data.recent.length === 0 ? <p className="text-sm text-[#6B6B6B]">Nothing yet.</p> : (
                  <ul className="space-y-3 text-sm">
                    {data.recent.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3">
                        <a href={`/birthday/${r.slug}`} target="_blank" rel="noopener noreferrer" className="truncate font-medium underline">{r.slug}</a>
                        <span className="shrink-0 text-xs text-[#6B6B6B]">{when(r.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/admin/websites" className="mt-4 inline-block text-sm font-semibold underline">See all websites</Link>
              </Card>
            </div>
            <Card title="Usage and limits">
              <p className="text-sm text-[#3a3a3f]">Database size: <strong>{data.usage ? bytes(data.usage.db_bytes) : "n/a"}</strong> (Supabase free limit 500 MB).</p>
              <p className="mt-2 text-sm text-[#6B6B6B]">UniqueVerse does not call any paid AI or token-based API, so there are no tokens or costs to show. Hosting traffic and request limits are only visible in your Cloudflare dashboard (Workers &amp; Pages, Metrics) and Supabase (Project Settings, Usage). We do not guess those numbers here.</p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
