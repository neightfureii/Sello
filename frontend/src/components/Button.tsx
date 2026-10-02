import type { ButtonHTMLAttributes } from "react";

export function Button({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button 
      className={`w-full bg-sello-blue text-white rounded-full py-3.5 font-semibold hover:bg-blue-800 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}