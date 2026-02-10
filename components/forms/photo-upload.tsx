"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { compressImage } from "@/lib/utils/compress-image";

interface PhotoUploadProps {
  name: string;
  currentUrl?: string | null;
  className?: string;
}

export function PhotoUpload({ name, currentUrl, className }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await compressImage(file);

      // Reemplazar el archivo del input con el comprimido
      const dt = new DataTransfer();
      dt.items.add(compressed);
      if (inputRef.current) inputRef.current.files = dt.files;

      setPreview(URL.createObjectURL(compressed));
    } catch {
      // Si falla la compresión, usar el original
      setPreview(URL.createObjectURL(file));
    } finally {
      setCompressing(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-zinc-300">Foto</label>
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 rounded-xl object-cover bg-zinc-800"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={compressing}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 transition-colors"
          >
            {compressing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Upload size={18} />
                <span className="text-[10px]">Subir</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
