"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Photo = { src: string; alt: string };

export default function ArticleBody({ html, introHtml = "", children }: { html: string; introHtml?: string; children?: ReactNode }) {
  const [gallery, setGallery] = useState<{ photos: Photo[]; index: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const captionId = useId();
  const isOpen = gallery !== null;
  const image = gallery?.photos[gallery.index];

  function cycleImage(direction: number) {
    setGallery(current => current ? {
      ...current,
      index: (current.index + direction + current.photos.length) % current.photos.length,
    } : null);
  }

  useEffect(() => {
    const modal = dialog.current;
    if (!isOpen || !modal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.showModal();
    return () => {
      if (modal.open) modal.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={event => {
          if (!(event.target instanceof Element)) return;
          const button = event.target.closest<HTMLButtonElement>("button.article-image");
          const photo = button?.querySelector("img");
          if (!button || !photo) return;
          const photos = Array.from(event.currentTarget.querySelectorAll<HTMLImageElement>("button.article-image img"));
          const index = photos.indexOf(photo);
          if (index < 0) return;
          trigger.current = button;
          button.focus({ preventScroll: true });
          setGallery({ photos: photos.map(photo => ({ src: photo.currentSrc || photo.src, alt: photo.alt })), index });
        }}
      >
        {introHtml && <div className="article-body article-intro" dangerouslySetInnerHTML={{ __html: introHtml }} />}
        {children}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <dialog
        ref={dialog}
        className="article-lightbox"
        data-gallery={gallery && gallery.photos.length > 1 ? "true" : undefined}
        aria-label="Enlarged image"
        aria-describedby={image?.alt ? captionId : undefined}
        onClick={event => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            cycleImage(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        onClose={() => {
          setGallery(null);
          trigger.current?.focus({ preventScroll: true });
        }}
      >
        <button type="button" className="article-lightbox-close" aria-label="Close enlarged image" onClick={() => dialog.current?.close()}>
          <X size={24} aria-hidden="true" />
        </button>
        {image && <figure>
          <img src={image.src} alt={image.alt} className="article-lightbox-image" />
          {image.alt && <figcaption id={captionId}>{image.alt}</figcaption>}
        </figure>}
        {gallery && gallery.photos.length > 1 && <div className="article-lightbox-controls" role="group" aria-label="Image navigation">
          <button type="button" className="article-lightbox-nav" aria-label="Previous image" onClick={() => cycleImage(-1)}>
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <span className="article-lightbox-count" aria-live="polite" aria-atomic="true">{gallery.index + 1} / {gallery.photos.length}</span>
          <button type="button" className="article-lightbox-nav" aria-label="Next image" onClick={() => cycleImage(1)}>
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>}
      </dialog>
    </>
  );
}
