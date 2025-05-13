import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function Loading({ size = "medium", className }: LoadingProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-t-transparent",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
} 