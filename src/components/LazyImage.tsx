import React, { useState, useRef, useEffect, memo } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const LazyImage = memo(
  ({ src, alt, className, placeholder, onError }: LazyImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "50px",
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true);
      if (onError) {
        onError(e);
      }
    };

    const defaultPlaceholder = (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-600">
        {hasError ? "No Image" : "Loading..."}
      </div>
    );

    return (
      <div ref={imgRef} className={className}>
        {!isInView || hasError ? (
          placeholder || defaultPlaceholder
        ) : (
          <>
            {!isLoaded && (placeholder || defaultPlaceholder)}
            <img
              src={src}
              alt={alt}
              className={`${className} ${
                isLoaded ? "opacity-100" : "opacity-0"
              } transition-opacity duration-200`}
              onLoad={handleLoad}
              onError={handleError}
              style={isLoaded ? {} : { position: "absolute", top: 0, left: 0 }}
            />
          </>
        )}
      </div>
    );
  }
);

LazyImage.displayName = "LazyImage";

export default LazyImage;
