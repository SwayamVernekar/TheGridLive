import { motion } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'


export function StandardCard({ 
  image, // Assuming 'image' is a URL or a React component
  title, 
  description, 
  children, 
  className = '', 
  variant = 'glass' 
}) {
  const baseClass = variant === 'glass' ? 'glass-strong' : 'bg-f1gray';
  
  return (
    <motion.div
      className={`rounded-xl p-6 shadow-lg ${baseClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'tween' }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Assuming the image is meant to be a header or banner */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
            {/* If 'image' is a string URL, use an img tag. If it's a component, just render it. */}
            {typeof image === 'string' ? <img src={image} alt={title} className="w-full h-auto object-cover" /> : image}
        </div>
      )}
      
      <h3 className="text-xl font-bold text-f1light mb-2">{title}</h3>
      {description && <p className="text-f1light/80">{description}</p>}
      {children}
    </motion.div>
  );
}