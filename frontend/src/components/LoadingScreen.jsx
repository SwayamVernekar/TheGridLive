import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'



export function LoadingScreen({ onComplete }) {
  const [loadingStage, setLoadingStage] = useState('tire');
  const [rotation, setRotation] = useState(0);

  // Constants for motion
  const motionDuration = 1.5;
  const motionRepeat = Infinity;

  useEffect(() => {
    // Tire spinning stage
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 15) % 360);
    }, 50);

    // After 2 seconds, morph into logo
    const morphTimer = setTimeout(() => {
      setLoadingStage('morph');
    }, 2000);

    // After 3.5 seconds, complete loading
    const completeTimer = setTimeout(() => {
      setLoadingStage('complete');
      setTimeout(onComplete, 500);
    }, 3500);

    return () => {
      clearInterval(rotationInterval);
      clearTimeout(morphTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Gradient text style object for the logo
  const logoTextStyle = {
    background: 'linear-gradient(135deg, #DC0000 0%, #FF0000 50%, #DC0000 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950"
      initial={{ opacity: 1 }}
      animate={{ opacity: loadingStage === 'complete' ? 0 : 1 }}
      transition={{ duration: 0.5, delay: loadingStage === 'complete' ? 0 : 0 }}
    >
      {/* Speed lines background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 bg-gradient-to-r from-transparent via-f1red/30 to-transparent"
            style={{
              top: `${(i * 5) + 10}%`,
              width: '200%', // Must be wide for full horizontal movement
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: motionRepeat,
              delay: i * 0.05,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Pirelli Tire / Logo Animation Container */}
        <motion.div
          className="relative"
          animate={{
            scale: loadingStage === 'morph' ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {loadingStage === 'tire' && (
              <motion.div
                key="tire"
                className="relative"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                style={{
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {/* F1 Racing Tire SVG */}
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {/* Outer tire rubber - black */}
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="#1a1a1a"
                    stroke="#0a0a0a"
                    strokeWidth="2"
                  />
                  
                  {/* Tire tread pattern */}
                  {[...Array(24)].map((_, i) => {
                    const angle = (i * 360) / 24;
                    const x1 = 100 + 85 * Math.cos((angle * Math.PI) / 180);
                    const y1 = 100 + 85 * Math.sin((angle * Math.PI) / 180);
                    const x2 = 100 + 95 * Math.cos((angle * Math.PI) / 180);
                    const y2 = 100 + 95 * Math.sin((angle * Math.PI) / 180);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#DC0000"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    );
                  })}
                  
                  {/* Inner rim ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="75"
                    fill="none"
                    stroke="#DC0000"
                    strokeWidth="6"
                  />
                  
                  {/* Wheel spokes - 5 spoke design */}
                  {[0, 72, 144, 216, 288].map((angle) => {
                    const x1 = 100 + 25 * Math.cos((angle * Math.PI) / 180);
                    const y1 = 100 + 25 * Math.sin((angle * Math.PI) / 180);
                    const x2 = 100 + 70 * Math.cos((angle * Math.PI) / 180);
                    const y2 = 100 + 70 * Math.sin((angle * Math.PI) / 180);
                    return (
                      <g key={angle}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#DC0000"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        {/* Spoke highlights */}
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#FF0000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Center hub with gradient */}
                  <defs>
                    <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#DC0000" />
                      <stop offset="100%" stopColor="#8B0000" />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="20" fill="url(#hubGradient)" />
                  
                  {/* Center hub details */}
                  <circle cx="100" cy="100" r="12" fill="none" stroke="#F5F5F5" strokeWidth="1" opacity="0.3" />
                  <circle cx="100" cy="100" r="6" fill="#0A0A0A" />
                </svg>

                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(220, 0, 0, 0.4)',
                      '0 0 60px rgba(220, 0, 0, 0.8)',
                      '0 0 30px rgba(220, 0, 0, 0.4)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: motionRepeat,
                    repeatType: "reverse",
                  }}
                />
              </motion.div>
            )}

            {loadingStage === 'morph' && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Logo Structure (Simplified Checkered Flag/Grid) */}
                <div className="w-96 h-24 overflow-hidden mb-4 rounded-lg border border-f1red/50">
                  <svg width="300" height="100" viewBox="0 0 300 100" className="opacity-10">
                    {[...Array(8)].map((_, i) =>
                      [...Array(8)].map((_, j) => (
                        <rect
                          key={`${i}-${j}`}
                          x={i * 37.5}
                          y={j * 12.5}
                          width="37.5"
                          height="12.5"
                          fill={(i + j) % 2 === 0 ? '#F5F5F5' : 'transparent'}
                        />
                      ))
                    )}
                  </svg>
                </div>

                <div className="text-center">
                  <motion.h1
                    className="text-6xl font-bold mb-2"
                    style={logoTextStyle}
                    animate={{
                      backgroundPosition: ['0% center', '200% center', '0% center'],
                    }}
                    transition={{
                      duration: 4,
                      repeat: motionRepeat,
                      ease: 'linear',
                    }}
                  >
                    TheGridLive
                  </motion.h1>
                  <motion.div
                    className="text-f1red text-sm uppercase tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    Your Race Engineer
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="mt-8 text-f1light/80 uppercase tracking-widest text-sm"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: motionDuration, repeat: motionRepeat, repeatType: "reverse" }}
        >
          Loading Race Data...
        </motion.div>
        
        {/* Pulsing Dots */}
        <div className="flex gap-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-f1red"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: motionRepeat,
                delay: i * 0.2,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}