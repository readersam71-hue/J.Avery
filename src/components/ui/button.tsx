import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "emergency" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-blue-900 text-white hover:bg-blue-800",
      secondary: "bg-green-600 text-white hover:bg-green-700",
      emergency: "bg-red-600 text-white hover:bg-red-700 animate-pulse",
      outline: "border-2 border-blue-900 text-blue-900 hover:bg-blue-50",
      ghost: "text-blue-900 hover:bg-blue-50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base font-semibold",
      lg: "px-8 py-4 text-lg font-bold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
