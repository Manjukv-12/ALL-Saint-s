/**
 * Run before React mounts. Fixes malformed encoded hashes so React Router
 * sees paths like /admin/events (otherwise pathname can break → NotFound).
 */
export function normalizeLocationHashOnce(): void {
  if (typeof window === "undefined") return;
  const full = window.location.hash;
  if (full.length <= 1) return;

  let path = full.slice(1);
  for (let i = 0; i < 8; i++) {
    try {
      const next = decodeURIComponent(path);
      if (next === path) break;
      path = next;
    } catch {
      break;
    }
  }
  path = path.replace(/%2F/gi, "/");
  path = path.replace(/%5C/gi, "/");
  path = path.replace(/\/{2,}/g, "/");
  if (path && !path.startsWith("/") && !/^https?:\/\//i.test(path)) {
    path = `/${path.replace(/^\/+/, "")}`;
  }
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  // All app routes are lowercase; #/Admin/events would otherwise hit * → 404.
  const lower = path.toLowerCase();
  if (path !== lower) {
    path = lower;
  }
  const norm = path ? `#${path}` : "";
  if (norm && norm !== full) {
    window.history.replaceState(null, "", window.location.pathname + window.location.search + norm);
  }
}
