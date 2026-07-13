interface LogoProps {
  /** Extra class to size the image, e.g. "hero-logo". */
  className?: string;
  /** Alt text for the logo. */
  alt: string;
  /** Optional intrinsic dimensions for CLS prevention. */
  width?: number;
  height?: number;
  /** Alternate approved logo asset. */
  src?: string;
}

export default function Logo({
  className,
  alt,
  width,
  height,
  src = "/logo.png",
}: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`logo-img${className ? " " + className : ""}`}
      width={width}
      height={height}
    />
  );
}
