import type { InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

export function InputField({ label, icon, rightIcon, className = "", ...props }: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      <div className="relative flex items-center">
        {icon && <span className="absolute left-4 text-gray-500">{icon}</span>}
        <input
          className={`w-full bg-blue-50 border border-transparent focus:bg-white focus:border-sello-blue focus:ring-1 focus:ring-sello-blue outline-none rounded-full py-3.5 text-sm transition-all ${icon ? 'pl-11' : 'pl-4'} ${rightIcon ? 'pr-11' : 'pr-4'}`}
          {...props}
        />
        {rightIcon && <span className="absolute right-4 text-gray-400">{rightIcon}</span>}
      </div>
    </div>
  );
}