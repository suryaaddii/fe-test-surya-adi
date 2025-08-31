"use client";
import { useEffect, useState } from "react";

export default function SafeImg({
  src,
  fallback,
  alt = "",
  className = "",
  ...rest
}) {
  const [url, setUrl] = useState(src || fallback);

  useEffect(() => {
    setUrl(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setUrl(fallback)}
      {...rest}
    />
  );
}
