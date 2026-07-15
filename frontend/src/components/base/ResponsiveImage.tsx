import { useMemo } from "react";

type LoadingMode = "lazy" | "eager";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  loading?: LoadingMode;
  priority?: boolean;
  decoding?: "async" | "auto" | "sync";
  fallbackSrc?: string;
}

function isRemoteResizableImage(src: string) {
  try {
    return new URL(src).hostname.includes("readdy.ai");
  } catch {
    return false;
  }
}

function resizeRemoteImage(src: string, width: number, height: number) {
  if (!isRemoteResizableImage(src)) return src;

  const url = new URL(src);
  url.searchParams.set("width", String(width));
  url.searchParams.set("height", String(height));
  return url.toString();
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  priority = false,
  decoding = "async",
  fallbackSrc = "/images/membership/hero.svg",
}: ResponsiveImageProps) {
  const srcSet = useMemo(() => {
    if (!isRemoteResizableImage(src)) return undefined;

    const candidates = [480, 768, 1024, 1400, 1800].filter((candidate) => candidate <= Math.max(width * 1.25, 768));
    const ratio = height / width;
    return candidates.map((candidate) => `${resizeRemoteImage(src, candidate, Math.round(candidate * ratio))} ${candidate}w`).join(", ");
  }, [height, src, width]);

  return (
    <img
      src={resizeRemoteImage(src, width, height)}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : loading}
      fetchPriority={priority ? "high" : "auto"}
      decoding={decoding}
      className={className}
      onError={(event) => {
        const image = event.currentTarget;
        if (image.getAttribute("src") === fallbackSrc) return;
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        image.src = fallbackSrc;
      }}
    />
  );
}
