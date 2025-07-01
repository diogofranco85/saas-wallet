import { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface ICustomCard {
  children: ReactNode;
  className?: string
}

export function CustomCard({ children, className }: ICustomCard) {
  return (
    <Card className={cn("border-pink-600", className)}>
      {children}
    </Card>
  )
}