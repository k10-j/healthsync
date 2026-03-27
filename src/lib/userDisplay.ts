import type { ApiUser } from "@/lib/api";

/** First word of full name, or email local-part, for short greetings (e.g. hero card). */
export function greetingDisplayName(user: ApiUser | null | undefined): string {
  if (!user) return "User";
  const full = user.fullName?.trim();
  if (full) {
    const first = full.split(/\s+/)[0];
    return first || full;
  }
  const local = user.email?.split("@")[0]?.trim();
  if (local) return local;
  return "User";
}

/** Full name for profile header; falls back to email local-part then label. */
export function profileDisplayName(user: ApiUser | null | undefined): string {
  if (!user) return "User";
  const full = user.fullName?.trim();
  if (full) return full;
  const local = user.email?.split("@")[0]?.trim();
  if (local) return local;
  return "User";
}
