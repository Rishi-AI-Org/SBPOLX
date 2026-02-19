"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

export default function ImageUpload({
  onImagesChange,
  existingImages = [],
  maxImages = 5,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError("");

    const filesToUpload = Array.from(files).slice(0, remaining);
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5 MB)`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Upload failed");
          continue;
        }

        const data = await res.json();
        newUrls.push(data.url);
      } catch {
        setError("Upload failed. Please try again.");
      }
    }

    const updated = [...images, ...newUrls];
    setImages(updated);
    onImagesChange(updated);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="150px" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              x
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded">
                Primary
              </span>
            )}
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-gray-500 mt-1">
              {uploading ? "Uploading..." : "Add Photo"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">
        {images.length}/{maxImages} images. Max 5 MB each. First image is the thumbnail.
      </p>
    </div>
  );
}
