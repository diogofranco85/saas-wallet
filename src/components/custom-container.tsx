import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ICustomContainer {
  children: ReactNode;
  className?: string
}

export function CustomContainer({ children, className }: ICustomContainer) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {children}
    </div>
  )
}