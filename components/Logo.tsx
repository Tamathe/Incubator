/**
 * Renders BOTH logo variants; CSS hides one based on data-theme.
 *
 *   public/logo-mark.png       — clean vector (light mode + default)
 *   public/logo-mark-dark.png  — textured photographic (dark mode, with
 *                                preserved surface character)
 *
 * The CSS theme-swap lives in app/globals.css under ".logo-img--light" and
 * ".logo-img--dark" — see the bottom of that file.
 */
interface LogoProps {
  /** Extra class to size the images (e.g. "hero-logo"). */
  className?: string;
  /** Alt text for the primary (light-mode) image only — the dark variant
   *  is rendered aria-hidden so screen readers don't see "logo" twice. */
  alt: string;
  /** Optional intrinsic dimensions for CLS prevention. */
  width?: number;
  height?: number;
}

export default function Logo({ className, alt, width, height }: LogoProps) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt={alt}
        className={`logo-img logo-img--light${className ? " " + className : ""}`}
        width={width}
        height={height}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark-dark.png"
        alt=""
        aria-hidden="true"
        className={`logo-img logo-img--dark${className ? " " + className : ""}`}
        width={width}
        height={height}
      />
    </>
  );
}
