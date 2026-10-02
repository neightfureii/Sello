import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 md:p-10 ${className}`}>
      {children}
    </div>
  );
}