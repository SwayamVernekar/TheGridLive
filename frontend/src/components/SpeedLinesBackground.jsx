import { motion } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'

export function SpeedLinesBackground() {
  // Common motion constants
  const repeat = Infinity;
  const ease = "linear";
  const generalDuration = 3;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Carbon fiber texture overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          // Using a repeating linear gradient to simulate carbon fiber weave
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.1) 0px,
              transparent 2px,
              transparent 4px,
              rgba(255, 255, 255, 0.1) 6px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.1) 0px,
              transparent 2px,
              transparent 4px,
              rgba(255, 255, 255, 0.1) 6px
            )
          `,
        }}
      />

      {/* Animated RED speed lines */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`red-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-f1red to-transparent"
          style={{
            top: `${(i * 100) / 15}%`,
            // Corrected fragmented style properties with calculated random values
            width: `${Math.random() * 400 + 200}px`, 
            left: `${Math.random() * -100}px`,
            opacity: Math.random() * 0.5 + 0.2,
          }}
          initial={{ x: 0 }}
          animate={{
            x: ['0vw', '150vw'], // Animate movement across the screen
          }}
          transition={{
            duration: Math.random() * 3 + 2, // Random duration 2-5s
            repeat: repeat,
            delay: Math.random() * 3, // Random delay
            ease: ease,
          }}
        />
      ))}

      {/* Animated WHITE speed lines */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`white-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            top: `${(i * 100) / 10}%`,
            // Corrected fragmented style properties
            width: `${Math.random() * 300 + 150}px`,
            left: `${Math.random() * -100}px`,
            opacity: Math.random() * 0.4 + 0.1,
          }}
          initial={{ x: 0 }}
          animate={{
            x: ['0vw', '150vw'],
          }}
          transition={{
            duration: Math.random() * 4 + 3, // Random duration 3-7s
            repeat: repeat,
            delay: Math.random() * 4,
            ease: ease,
          }}
        />
      ))}

      {/* Vertical grid lines with pulsing opacity */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`grid-${i}`}
          className="absolute w-px h-full bg-gradient-to-b from-transparent via-f1red/10 to-transparent"
          style={{
            left: `${(i * 100) / 8}%`,
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1], // Pulse opacity
          }}
          transition={{
            duration: generalDuration,
            repeat: repeat,
            delay: i * 0.5, // Staggered delay
            repeatType: "reverse",
          }}
        />
      ))}

      {/* Pulsing corner accents (Top Left) */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-f1red/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: repeat,
          repeatType: "reverse",
        }}
      />
      
      {/* Pulsing corner accents (Bottom Right) */}
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-f1blue/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: repeat,
          delay: 1.5,
          repeatType: "reverse",
        }}
      />
    </div>
  );
}