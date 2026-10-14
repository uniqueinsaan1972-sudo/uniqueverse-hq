"use client";
import { useState } from "react";
import { Card, ErrorBox, Skeleton, Stat, input, useApi } from "@/components/admin/ui";

type Summary = {
  views: number; visitors: number; today_views: number; customize_started: number; generations_ok: number; generations_failed: number;
  per_day: { day: string; views: number }[]; top_pages: { path: string; views: number }[];
  top_templates: { template: string; views: number }[]; generated_by_template: { template: string; count: number }[];
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const { data, error, loading } = useApi<Summary>(`/api/admin/analytics?days=${days}`);
  const max = Math.max(1, ...(data?.per_day.map((d) => d.views) ?? [1]));
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Counted since analytics was switched on. Earlier visits are not included.</p>
        </div>
        <select aria-label="Period" className={`${input} !w-auto`} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      </div>
      <div className="mt-6 space-y-5">
        {error && <ErrorBox message={error} />}
        {loading && !data && <Skeleton />}
        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Page views" value={data.views} />
              <Stat label="Visitors" value={data.visitors} hint="Different browsers, not people" />
              <Stat label="Views today" value={data.today_views} />
              <Stat label="Websites generated" value={data.generations_ok} hint={`${data.generations_failed} failed`} />
            </div>
            <Card title="Page views per day">
              {data.per_day.length === 0 ? <p className="text-sm text-[#6B6B6B]">No data yet.</p> : (
                <div className="flex h-40 items-end gap-1.5" role="img" aria-label="Bar chart of page views per day">
                  {data.per_day.map((d) => (
                    <div key={d.day} className="group relative flex-1">
                      <div className="rounded-t bg-[#111111]" style={{ height: `${Math.max(4, (d.views / max) * 150)}px` }} />
                      <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#111111] px-2 py-0.5 text-xs text-white group-hover:block">{d.day.slice(5)}: {d.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Most visited pages">
                {data.top_pages.length === 0 ? <p className="text-sm text-[#6B6B6B]">No data yet.</p> : <ul className="space-y-2 text-sm">{data.top_pages.map((p) => <li key={p.path} className="flex justify-between gap-3"><span className="truncate">{p.path}</span><b>{p.views}</b></li>)}</ul>}
              </Card>
              <Card title="Most viewed templates">
                {data.top_templates.length === 0 ? <p className="text-sm text-[#6B6B6B]">No data yet.</p> : <ul className="space-y-2 text-sm">{data.top_templates.map((p) => <li key={p.template} className="flex justify-between gap-3"><span className="truncate">{p.template}</span><b>{p.views}</b></li>)}</ul>}
              </Card>
              <Card title="Websites generated per template">
                {data.generated_by_template.length === 0 ? <p className="text-sm text-[#6B6B6B]">No data yet.</p> : <ul className="space-y-2 text-sm">{data.generated_by_template.map((p) => <li key={p.template} className="flex justify-between gap-3"><span className="truncate">{p.template}</span><b>{p.count}</b></li>)}</ul>}
              </Card>
              <Card title="Funnel">
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between"><span>Opened a template page</span><b>{data.top_templates.reduce((a, b) => a + b.views, 0)}</b></li>
                  <li className="flex justify-between"><span>Started customizing</span><b>{data.customize_started}</b></li>
                  <li className="flex justify-between"><span>Generated a website</span><b>{data.generations_ok}</b></li>
                </ul>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
