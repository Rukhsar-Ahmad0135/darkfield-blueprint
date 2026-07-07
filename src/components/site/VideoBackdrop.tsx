import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string;
  className?: string;
  poster?: string;
};

/**
 * Fullbleed background video optimized for smooth playback:
 * - Preloads the full file (preload="auto") so decoding never stalls.
 * - Keeps the video playing continuously once mounted (no play/pause on scroll,
 *   which was the main source of stutter — every re-play forced a re-buffer).
 * - Only mutes/unmutes based on viewport visibility so audio doesn't bleed
 *   across sections while video keeps buffering smoothly in the background.
 */
export function VideoBackdrop({ src, className, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userMuted, setUserMuted] = useState(true);
  const [inView, setInView] = useState(false);

  // Hydrate stored preference after mount to avoid SSR mismatch.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("dftl:video-muted") === "0") setUserMuted(false);
  }, []);

  // Kick off playback once and keep it running to avoid re-buffer stutter.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, []);

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
    const shouldPlayAudio = !userMuted && inView;
    v.muted = !shouldPlayAudio;
    sessionStorage.setItem("dftl:video-muted", userMuted ? "1" : "0");
    if (shouldPlayAudio) v.play().catch(() => {});
  }, [userMuted, inView]);

  return (
    <div ref={containerRef} className={className}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        loop
        autoPlay
        muted
        preload="auto"
        // @ts-expect-error - non-standard but respected by Safari
        disableRemotePlayback
        style={{ willChange: "transform", transform: "translateZ(0)" }}
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
