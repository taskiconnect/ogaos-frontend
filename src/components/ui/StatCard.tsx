// src/components/ui/StatCard.tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;          // e.g. "+12.4%" or "-8.2%"
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  description?: string;     // optional extra line
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">{value}</div>

        {(change || description) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {change && (
              <p
                className={cn(
                  "font-medium",
                  isPositive && "text-green-600 dark:text-green-400",
                  isNegative && "text-red-600 dark:text-red-400",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}

            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}