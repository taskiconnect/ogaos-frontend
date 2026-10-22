"use client";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/useSubscription";
export default function SubscriptionNotice() {
  const { subscription, isActive, isLoading, isError } = useSubscription();
  if (
    isLoading ||
    isError ||
    !subscription ||
    subscription.plan === "free" ||
    isActive
  )
    return null;
  return (
    <aside
      role="status"
      className="m-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:mx-8"
    >
      <strong>
        Your {subscription.plan} subscription is no longer active.
      </strong>
      <p className="mt-1 text-sm">
        Your dashboard remains available. Renew to restore paid features.
      </p>
      <Link
        className="mt-2 inline-block font-semibold underline"
        href="/dashboard/subscription"
      >
        Renew subscription
      </Link>
    </aside>
  );
}
