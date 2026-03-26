"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/** Must match `.home-launch__el` animation duration in `globals.css` (home-circular-in). */
const INTRO_ANIMATION_DURATION_MS = 780;

/** Largest `animationDelay` among `.home-launch__el` blocks (seconds → ms). */
const MAX_STAGGER_DELAY_MS = 380;

/** Small pause after the last element finishes so the screen doesn’t cut off mid-ease. */
const REDIRECT_BUFFER_MS = 120;

const REDIRECT_AFTER_ANIMATION_MS =
  MAX_STAGGER_DELAY_MS + INTRO_ANIMATION_DURATION_MS + REDIRECT_BUFFER_MS;

/** When motion is reduced, intro is instant; use a short delay before navigating. */
const REDIRECT_REDUCED_MOTION_MS = 400;

/** Entry angles (deg): blocks glide in from around a circle, clockwise from top. */
const ENTRY_ANGLES_DEG = [-90, -18, 54, 126, 198] as const;

export default function HomeLanding() {
  const router = useRouter();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const redirectMs = useMemo(
    () =>
      reducedMotion ? REDIRECT_REDUCED_MOTION_MS : REDIRECT_AFTER_ANIMATION_MS,
    [reducedMotion],
  );

  useEffect(() => {
    const redirect = window.setTimeout(() => {
      router.replace("/editor");
    }, redirectMs);
    return () => window.clearTimeout(redirect);
  }, [router, redirectMs]);

  const rootStyle = {
    "--home-auto-redirect-ms": `${redirectMs}ms`,
  } as React.CSSProperties;

  return (
    <div
      className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-zinc-950 text-zinc-100"
      style={rootStyle}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-0 h-[380px] w-[380px] rounded-full bg-violet-500/15 blur-[90px]" />
      </div>

      <main
        className="relative flex flex-1 flex-col items-center justify-center px-6 py-16"
        style={
          {
            "--orbit-r": "clamp(2.25rem, 14vmin, 4rem)",
          } as React.CSSProperties
        }
      >
        <p
          className="home-launch__el mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500"
          style={
            {
              "--a": `${ENTRY_ANGLES_DEG[0]}deg`,
              animationDelay: "0.06s",
            } as React.CSSProperties
          }
        >
          Local-first
        </p>
        <h1
          className="home-launch__el max-w-lg text-center text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl"
          style={
            {
              "--a": `${ENTRY_ANGLES_DEG[1]}deg`,
              animationDelay: "0.14s",
            } as React.CSSProperties
          }
        >
          HTML editor with live preview
        </h1>
        <p
          className="home-launch__el mt-4 max-w-md text-center text-sm leading-relaxed text-zinc-400"
          style={
            {
              "--a": `${ENTRY_ANGLES_DEG[2]}deg`,
              animationDelay: "0.22s",
            } as React.CSSProperties
          }
        >
          One document, internal or inline CSS only. Your work stays in this
          browser—no account, no server storage.
        </p>
        <p
          className="home-launch__el mt-8 text-center text-sm text-zinc-500"
          style={
            {
              "--a": `${ENTRY_ANGLES_DEG[3]}deg`,
              animationDelay: "0.3s",
            } as React.CSSProperties
          }
        >
          Opening the editor when this intro finishes…
        </p>
        <Link
          href="/editor"
          className="home-launch__el mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-8 text-sm font-medium text-zinc-950 transition-transform hover:bg-white active:scale-[0.98]"
          style={
            {
              "--a": `${ENTRY_ANGLES_DEG[4]}deg`,
              animationDelay: "0.38s",
            } as React.CSSProperties
          }
        >
          Open editor now
        </Link>
      </main>

      <div className="relative h-1 w-full shrink-0 bg-zinc-900" aria-hidden>
        <div className="home-launch__progress-bar h-full w-full bg-gradient-to-r from-blue-500 to-violet-500" />
      </div>
    </div>
  );
}
