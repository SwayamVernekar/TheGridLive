import { motion } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'



export function Logo({ className = '', showText = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Stylized G with checkered flag pattern */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Checkered pattern background */}
        <defs>
          <pattern id="checker" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#DC0000" />
            <rect x="4" y="4" width="4" height="4" fill="#DC0000" />
            <rect x="4" y="0" width="4" height="4" fill="#F5F5F5" />
            <rect x="0" y="4" width="4" height="4" fill="#F5F5F5" />
          </pattern>
        </defs>
        
        {/* G Letter with checkered flag */}
        <path
          d="M20 4C11.163 4 4 11.163 4 20C4 28.837 11.163 36 20 36C24.418 36 28.418 34.209 31.314 31.314L27.657 27.657C25.732 29.582 23.01 30.8 20 30.8C14.256 30.8 9.6 26.144 9.6 20.4C9.6 14.656 14.256 10 20 10C23.01 10 25.732 11.218 27.657 13.143L31.314 9.486C28.418 6.591 24.418 4 20 4Z"
          fill="url(#checker)"
        />
        
        {/* Inner G detail */}
        <rect x="20" y="18" width="12" height="4" fill="#DC0000" rx="1" />
        
        {/* Inner G detail animated wipe */}
        <motion.rect
          x="20"
          y="18"
          width="12"
          height="4"
          fill="#F5F5F5"
          rx="1"
          // Animate scaleX from full (1) to zero (0) and back
          animate={{ scaleX: [1, 0, 1] }} 
          // Set transformOrigin to the right (12px wide) so it wipes left
          style={{ originX: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      
      {showText && (
        <motion.span 
          className="text-2xl font-extrabold text-f1light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          TheGridLive
        </motion.span>
      )}
    </div>
  );
}