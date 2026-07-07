import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string;
  className?: string;
  poster?: string;
};

/**
 * Fullbleed background video that plays (with audio) only when the section
 * is visible in the viewport. Browsers block autoplay with sound until the
 * user interacts with the page, so we start muted and expose a sound toggle.
 * Once the user unmutes, we remember the preference for the session.
 */
export function VideoBackdrop({ src, className, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [muted, setMuted] = useState(true);

  // Hydrate stored preference after mount to avoid SSR mismatch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("dftl:video-muted") === "0") setMuted(false);
  }, []);

  // Play/pause based on visibility.
  useEffect(() => {
    const el = containerRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.25) {
            v.play().catch(() => {
              // Autoplay with sound blocked — retry muted.
              v.muted = true;
              v.play().catch(() => {});
            });
          } else {
            v.pause();
          }
        }
      },
      { threshold: [0, 0.25, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Sync muted state to element + persist.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    sessionStorage.setItem("dftl:video-muted", muted ? "1" : "0");
    if (!muted) {
      v.play().catch(() => {});
    }
  }, [muted]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        muted={muted}
        preload="metadata"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute background video" : "Mute background video"}
        className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 border border-hairline bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm hover:border-white hover:text-white"
      >
        {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
        {muted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );
}
