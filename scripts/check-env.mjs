// Runs before every build/deploy. The two NEXT_PUBLIC_ values are baked into the website files
// while building. If they are missing, sign up and sign in break for every visitor.
import fs from "node:fs";

function parse(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = { ...parse(".env"), ...parse(".env.local"), ...process.env };
const bad = [];
const warn = [];
const isPlaceholder = (v) => !v || /your-|paste-|example|xxxx/i.test(v);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) bad.push("NEXT_PUBLIC_SUPABASE_URL is missing. Add the line to .env.local (Supabase > Project Settings > API > Project URL).");
else if (isPlaceholder(url) || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) bad.push(`NEXT_PUBLIC_SUPABASE_URL must look like https://abcd1234.supabase.co (it is: "${url.slice(0, 40)}").`);

const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (isPlaceholder(key)) bad.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing or still the placeholder. Paste the PUBLISHABLE key (starts with sb_publishable_).");
else if (key.startsWith("sb_secret_")) bad.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contains the SECRET key. Stop: put the publishable key there, and create a new secret key in Supabase because this one is now exposed in your file.");

if (env.SUPABASE_URL && url && env.SUPABASE_URL.replace(/\/$/, "") !== url.replace(/\/$/, "")) warn.push("SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL are different projects. They must be the same.");
const site = env.NEXT_PUBLIC_SITE_URL;
if (isPlaceholder(site) || /localhost/.test(site ?? "")) warn.push("NEXT_PUBLIC_SITE_URL should be your real address (for example https://your-site.workers.dev), not a placeholder or localhost.");
if (!fs.existsSync(".env.local") && !process.env.NEXT_PUBLIC_SUPABASE_URL) warn.push("There is no .env.local file in this folder.");

for (const w of warn) console.warn(`WARNING: ${w}`);
if (bad.length) {
  console.error("\nDeploy stopped. Fix these first:\n");
  for (const b of bad) console.error(` - ${b}`);
  console.error("\nThen run the same command again. (The server secrets are set separately with: npx wrangler secret put NAME)\n");
  process.exit(1);
}
console.log("Environment check passed.");
