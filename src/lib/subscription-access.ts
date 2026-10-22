import type { Subscription } from "./api/types";
export function isSubscriptionUsable(
  sub: Subscription | null,
  now = Date.now(),
): boolean {
  if (!sub) return false;
  if (sub.status === "grace_period")
    return (
      !!sub.grace_period_ends_at && Date.parse(sub.grace_period_ends_at) > now
    );
  if (sub.status !== "active") return false;
  return (
    sub.plan === "free" ||
    (!!sub.current_period_end && Date.parse(sub.current_period_end) > now)
  );
}
