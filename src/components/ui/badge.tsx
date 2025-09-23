import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90 shadow-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 shadow-secondary/20",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-destructive/20",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground shadow-border/20",
        success:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 [a&]:hover:bg-emerald-200 dark:[a&]:hover:bg-emerald-900/30 shadow-emerald/20",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 [a&]:hover:bg-amber-200 dark:[a&]:hover:bg-amber-900/30 shadow-amber/20",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 [a&]:hover:bg-blue-200 dark:[a&]:hover:bg-blue-900/30 shadow-blue/20",
        purple:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 [a&]:hover:bg-purple-200 dark:[a&]:hover:bg-purple-900/30 shadow-purple/20",
        gradient:
          "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white [a&]:hover:from-purple-600 [a&]:hover:to-pink-600 shadow-purple/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
