import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneFrame({
  children,
  className,
  floating,
}: {
  children: ReactNode;
  className?: string;
  floating?: "slow" | "delayed";
}) {
  return (
    <div
      className={cn(
        "phone w-full",
        floating === "slow" && "float-slow",
        floating === "delayed" && "float-delayed",
        className,
      )}
    >
      <div className="phone-screen relative">
        <div className="phone-notch" />
        {children}
      </div>
    </div>
  );
}
