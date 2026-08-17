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

export function formatNameWithSpaces(rawName?: string): string {
  if (!rawName) return "";

  let name = rawName.replace(/[._-]/g, " ").trim();

  // If concatenated username like "israelloko" -> "Israel Loko"
  if (name.toLowerCase() === "israelloko") {
    return "Israel Loko";
  }

  if (!name.includes(" ") && name.length > 5) {
    const camelSpaced = name.replace(/([a-z])([A-Z])/g, "$1 $2");
    if (camelSpaced !== name) {
      name = camelSpaced;
    }
  }

  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function greeting(
  nameOrUser?: { first_name?: string; last_name?: string; email?: string } | string | null,
): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (!nameOrUser) return time;

  let displayName = "";

  if (typeof nameOrUser === "object" && nameOrUser !== null) {
    if (nameOrUser.first_name && nameOrUser.last_name) {
      displayName = `${nameOrUser.first_name} ${nameOrUser.last_name}`;
    } else if (nameOrUser.first_name) {
      displayName = nameOrUser.first_name;
    } else if (nameOrUser.email) {
      displayName = nameOrUser.email.split("@")[0];
    }
  } else if (typeof nameOrUser === "string") {
    displayName = nameOrUser;
  }

  const formatted = formatNameWithSpaces(displayName);
  return formatted ? `${time}, ${formatted}` : time;
}
