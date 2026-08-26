import * as React from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-ink/10 bg-paper/90 p-5 shadow-[0_12px_40px_-24px_rgba(10,22,40,0.35)] backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

export function PanelTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-display text-xl tracking-tight text-ink", className)} {...props} />
  );
}
