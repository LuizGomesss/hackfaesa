import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-secondary", className)}
      {...props}
    />
  );
}
