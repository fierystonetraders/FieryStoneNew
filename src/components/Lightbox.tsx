/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxImage {
  url: string;
  name: string;
}

interface LightboxProps {
  images: LightboxImage[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, activeIndex, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((activeIndex + 1) % images.length);
      if (e.key === 'ArrowLeft') onNavigate((activeIndex - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeIndex, images.length, onClose, onNavigate]);

  const current = images[activeIndex];
  if (!current) return null;

  return (
    <div
      id="attachment-lightbox"
      className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-white hover:border-amber-500/50 transition z-10"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <span className="absolute top-4 left-4 sm:top-6 sm:left-6 text-xs font-mono text-stone-400 bg-stone-900/80 border border-stone-800 rounded-full px-3 py-1.5">
          {activeIndex + 1} / {images.length}
        </span>
      )}

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((activeIndex - 1 + images.length) % images.length);
          }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 transition"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <img
        src={current.url}
        alt={current.name}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
        referrerPolicy="no-referrer"
      />

      <p className="mt-4 text-xs text-stone-400 font-mono truncate max-w-full px-4">{current.name}</p>

      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((activeIndex + 1) % images.length);
          }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 transition"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
