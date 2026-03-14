import { cn } from "../lib";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition",
        variant === "primary" && "bg-orange-500 text-white hover:bg-orange-600",
        variant === "secondary" && "bg-slate-800 text-white hover:bg-slate-700",
        variant === "ghost" && "border border-slate-300 text-slate-800 hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
}
