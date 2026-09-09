"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryImage } from "@/content/gallery";

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const HOLD_DELAY_MS = 280;

export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const current = images[index];

  const close = useCallback(() => {
    setZoomed(false);
    onClose();
  }, [onClose]);

  const goTo = useCallback(
    (next: number) => {
      setZoomed(false);
      const wrapped = (next + images.length) % images.length;
      onNavigate(wrapped);
    },
    [images.length, onNavigate],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [close, goTo, index]);

  function pointFromEvent(e: React.TouchEvent | React.MouseEvent, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const point = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const x = ((point.clientX - rect.left) / rect.width) * 100;
    const y = ((point.clientY - rect.top) / rect.height) * 100;
    return `${x}% ${y}%`;
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    setOrigin(pointFromEvent(e, target));
    holdTimer.current = setTimeout(() => setZoomed(true), HOLD_DELAY_MS);
  }

  function clearHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setZoomed(false);
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLDivElement>) {
    setOrigin(pointFromEvent(e, e.currentTarget));
    setZoomed((z) => !z);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-dark-950/95 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <button
        onClick={close}
        className="absolute top-6 right-6 z-10 font-inter text-xs tracking-[0.15em] uppercase text-ivory-100/70 hover:text-ivory-100 transition-colors duration-300"
      >
        Close ✕
      </button>

      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous image"
        className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 z-10 font-inter text-2xl text-ivory-100/50 hover:text-ivory-100 transition-colors duration-300 px-3 py-6"
      >
        ‹
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next image"
        className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 z-10 font-inter text-2xl text-ivory-100/50 hover:text-ivory-100 transition-colors duration-300 px-3 py-6"
      >
        ›
      </button>

      <div
        className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto my-auto overflow-hidden select-none"
        style={{ touchAction: "pinch-zoom" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={clearHold}
        onTouchCancel={clearHold}
        onTouchMove={clearHold}
        onDoubleClick={handleDoubleClick}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain transition-transform duration-300 ease-out"
          style={{
            transform: zoomed ? "scale(2.1)" : "scale(1)",
            transformOrigin: origin,
          }}
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-xl px-6 text-center">
        {current.caption && (
          <p className="font-inter text-[13px] text-ivory-100/85 mb-2 leading-relaxed">{current.caption}</p>
        )}
        <p className="font-inter text-[10px] tracking-[0.12em] uppercase text-ivory-100/40">
          {index + 1} / {images.length} · Hold or double-click to zoom
        </p>
      </div>
    </div>
  );
}
