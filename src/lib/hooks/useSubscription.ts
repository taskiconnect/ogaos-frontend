"use client";

import { isSubscriptionUsable } from "@/lib/subscription-access";
import { getMySubscription } from "@/lib/api/subscription";
import type { SubscriptionPlan } from "@/lib/api/types";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RequireSubscriptionOptions = {
  redirectIfMissing?: boolean;
  requireActive?: boolean;
  requiredPlan?: Exclude<SubscriptionPlan, "free">;
  redirectTo?: string;
};

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  free: 0,
  growth: 1,
  pro: 2,
  custom: 3,
};

function hasRequiredPlan(
  currentPlan: SubscriptionPlan | undefined,
  requiredPlan?: Exclude<SubscriptionPlan, "free">,
): boolean {
  if (!requiredPlan) return true;
  if (!currentPlan) return false;
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}

export function useSubscription(options: RequireSubscriptionOptions = {}) {
  const {
    redirectIfMissing = false,
    requireActive = false,
    requiredPlan,
    redirectTo = "/dashboard/subscription",
  } = options;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const router = useRouter();
  const pathname = usePathname();

  const query = useQuery({
    queryKey: ["subscription", "me"],
    queryFn: getMySubscription,
    staleTime: 1000 * 60,
    retry: false,
  });

  const subscription = query.data?.data ?? null;

  const isActive = useMemo(
    () => isSubscriptionUsable(subscription, now),
    [subscription, now],
  );

  const hasPlanAccess = useMemo(() => {
    return hasRequiredPlan(subscription?.plan, requiredPlan);
  }, [subscription?.plan, requiredPlan]);

  const shouldRedirect = useMemo(() => {
    if (query.isLoading || query.isFetching) return false;
    if (pathname?.startsWith("/dashboard/subscription")) return false;

    if (redirectIfMissing && !subscription) return true;
    if (requireActive && !isActive) return true;
    if (requiredPlan && !hasPlanAccess) return true;

    return false;
  }, [
    query.isLoading,
    query.isFetching,
    pathname,
    redirectIfMissing,
    requireActive,
    requiredPlan,
    subscription,
    isActive,
    hasPlanAccess,
  ]);

  useEffect(() => {
    if (!shouldRedirect) return;

    const params = new URLSearchParams();

    if (!subscription) {
      params.set("reason", "missing_subscription");
    } else if (!isActive) {
      params.set("reason", "inactive_subscription");
      params.set("current_plan", subscription.plan);
      params.set("status", subscription.status);
    } else if (requiredPlan && !hasPlanAccess) {
      params.set("reason", "upgrade_required");
      params.set("current_plan", subscription.plan);
      params.set("required_plan", requiredPlan);
    }

    router.replace(
      `${redirectTo}${params.toString() ? `?${params.toString()}` : ""}`,
    );
  }, [
    shouldRedirect,
    subscription,
    isActive,
    hasPlanAccess,
    requiredPlan,
    redirectTo,
    router,
  ]);

  return {
    subscription,
    response: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isActive,
    hasPlanAccess,
  };
}
