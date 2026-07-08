import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string;
  className?: string;
  poster?: string;
  priority?: boolean;
};

/**
 * Fullbleed background video optimized for smooth playback:
 * - Loads the hero clip immediately, then lazy-loads later clips before they enter view.
 * - Keeps loaded clips warm without reassigning src, so scroll does not force re-buffering.
 * - Pauses clips only when they are far offscreen, avoiding two videos decoding at once.
 * - Gates audio by section visibility so sound does not bleed between sections.
 */
export function VideoBackdrop({ src, className, poster, priority = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userMuted, setUserMuted] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [shouldPlay, setShouldPlay] = useState(priority);
  const [inView, setInView] = useState(false);

  // Hydrate stored preference after mount to avoid SSR mismatch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("dftl:video-muted") === "0") setUserMuted(false);
  }, []);

  // Load later videos before they reach the viewport, but do not decode every
  // background video on page load. This keeps the visible clip smooth.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || priority) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "1400px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [priority]);

  // Track viewport proximity. A wide margin starts playback before the user
  // arrives; once far away, playback pauses without unloading the buffered file.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setShouldPlay(entry.isIntersecting),
      { rootMargin: "900px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [priority]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !shouldLoad) return;

    v.muted = true;
    v.playsInline = true;

    if (!shouldPlay) {
      v.pause();
      return;
    }

    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("canplay", tryPlay, { once: true });

    return () => v.removeEventListener("canplay", tryPlay);
  }, [shouldLoad, shouldPlay]);

  // Track viewport visibility for audio gating only.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.intersectionRatio > 0.35);
      },
      { threshold: [0, 0.35, 0.75] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mute unless the user has opted in AND section is in view.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const shouldPlayAudio = !userMuted && inView && shouldPlay;
    v.muted = !shouldPlayAudio;
    sessionStorage.setItem("dftl:video-muted", userMuted ? "1" : "0");
    if (shouldPlayAudio) v.play().catch(() => {});
  }, [userMuted, inView, shouldPlay]);

  return (
    <div ref={containerRef} className={className} style={{ contain: "layout paint style" }}>
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        poster={poster}
        playsInline
        loop
        autoPlay={priority}
        muted
        preload="auto"
        style={{ backfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={() => setUserMuted((m) => !m)}
        aria-label={userMuted ? "Unmute background video" : "Mute background video"}
        className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 border border-hairline bg-black/50 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-sm hover:border-white hover:text-white"
      >
        {userMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
        {userMuted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );
}
