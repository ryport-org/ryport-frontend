/** Base path for the staff dashboard within the main app. */
export const STAFF_BASE = "/staff";

export function staffPath(path = ""): string {
  if (!path || path === "/") return STAFF_BASE;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${STAFF_BASE}${normalized}`;
}
