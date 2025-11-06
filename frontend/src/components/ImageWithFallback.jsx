import { useState, useEffect } from 'react';
import { getPlaceholderImage } from '../utils/imageUtils';

/**
 * Universal image component with fallback support
 * Automatically handles image loading errors and provides placeholder images
 * 
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS classes to apply
 * @param {string} type - Type of image (driver, team, car, circuit, news, general)
 * @param {function} onError - Optional error callback
 * @param {function} onLoad - Optional load callback
 */
export const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  type = 'general',
  onError,
  onLoad,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      const fallbackSrc = getPlaceholderImage(type);
      console.warn(`[ImageWithFallback] Failed to load image: ${src}, using fallback: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      
      if (onError) {
        onError(e);
      }
    }
  };

  const handleLoad = (e) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={`${className} ${isLoading ? 'opacity-0 animate-pulse' : 'opacity-100'} transition-opacity duration-300`}
      loading="lazy" 
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ImageWithFallback;
