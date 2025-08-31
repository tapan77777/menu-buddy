'use client';
import Image from "next/image";
export default function ImagePreviewModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <Image
  src={imageUrl}
  alt="Full View"
  width={800}
  height={600}
  className="max-w-full max-h-full object-contain animate-scaleIn"
/>
    </div>
  );
}
