/** 1 NGN = 100 kobo */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function formatNaira(
  kobo: number,
  options?: { compact?: boolean; showSign?: boolean },
): string {
  const naira = koboToNaira(kobo);
  const sign = options?.showSign && naira > 0 ? "+" : "";

  if (options?.compact && Math.abs(naira) >= 1_000_000) {
    return `${sign}₦${(naira / 1_000_000).toFixed(1)}M`;
  }
  if (options?.compact && Math.abs(naira) >= 1_000) {
    return `${sign}₦${(naira / 1_000).toFixed(0)}k`;
  }

  return `${sign}${new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira)}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatRelativeDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function greeting(name?: string): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name?.split(" ")[0];
  return first ? `${time}, ${first}` : time;
}
