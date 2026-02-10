import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", text: "text-xs", pixels: 32 },
  md: { container: "w-10 h-10", text: "text-sm", pixels: 40 },
  lg: { container: "w-14 h-14", text: "text-lg", pixels: 56 },
  xl: { container: "w-20 h-20", text: "text-2xl", pixels: 80 },
};

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const s = sizeMap[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={s.pixels}
        height={s.pixels}
        className={cn(
          s.container,
          "rounded-full object-cover bg-zinc-800",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        s.container,
        "rounded-full bg-zinc-800 flex items-center justify-center font-semibold text-zinc-400",
        s.text,
        className
      )}
    >
      {fallback}
    </div>
  );
}
