import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface BlogTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function BlogTitleInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Untitled blog post...",
  className,
}: BlogTitleInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full border-0 bg-transparent p-0 text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/30 focus:outline-none",
        className
      )}
    />
  );
}
