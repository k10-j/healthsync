import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border/50",
        // HealthSync Custom Variants - Warmer, Friendlier
        success: "border-success/25 bg-success/15 text-success",
        warning: "border-warning/25 bg-warning/15 text-warning",
        accent: "border-accent/25 bg-accent/15 text-accent",
        // Medication Status
        taken: "border-success/25 bg-success/15 text-success",
        missed: "border-destructive/25 bg-destructive/15 text-destructive",
        skipped: "border-warning/25 bg-warning/15 text-warning",
        pending: "border-primary/25 bg-primary/15 text-primary",
        // Risk Levels
        "risk-low": "border-success/30 bg-success/15 text-success",
        "risk-medium": "border-warning/30 bg-warning/15 text-warning",
        "risk-high": "border-destructive/30 bg-destructive/15 text-destructive",
        // Category Tags
        category: "border-primary/25 bg-primary/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
