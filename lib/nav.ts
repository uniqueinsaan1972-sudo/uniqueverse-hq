/** Only allow redirects to pages on this site. */
export const safeNext = (n: string | null | undefined, fallback = "/account") =>
  n && n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : fallback;
