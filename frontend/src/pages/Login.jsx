import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'
import { Lock, Mail, Power, AlertCircle } from 'lucide-react';
// Assuming ImageWithFallback is defined elsewhere and works as intended
// import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// Mockup for ImageWithFallback to make the code runnable in isolation
const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);


export function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEngineStarting, setIsEngineStarting] = useState(false);
  const [error, setError] = useState('');

  const handleEngineStart = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('All systems must be active before start');
      return;
    }

    setIsEngineStarting(true);

    // Engine start sequence
    setTimeout(() => {
      onLogin();
      // Navigate after successful login simulation
      if (typeof onNavigate === 'function') {
        onNavigate('/');
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Cockpit Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://source.unsplash.com/2400x1600/?f1,cockpit,racing,speed"
          alt="F1 Cockpit"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        
        {/* Speed lines overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-f1red/30 to-transparent"
              style={{
                top: `${(i * 6) + 10}%`,
                width: '200%', // Must be wide enough for off-screen animation
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="glass-strong rounded-2xl p-8 md:p-12 max-w-md w-full shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', damping: 15 }}
        >
          {/* Decorative Corner Lights (Top Left) */}
          <motion.div
            className="absolute top-0 left-0 w-8 h-8 rounded-full blur-sm"
            style={{ backgroundColor: '#DC0000' }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          {/* Decorative Corner Lights (Bottom Right) */}
          <motion.div
            className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-f1red"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0.5,
            }}
          />

          {/* Logo/Branding */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Lock className="w-12 h-12 text-f1red mx-auto mb-2" />
            <h1 className="text-4xl font-extrabold text-f1light">Grid Access</h1>
            <p className="text-f1light/60">Ready for the race data.</p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleEngineStart} className="space-y-4">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-f1light/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="driver@thegridlive.com"
                disabled={isEngineStarting}
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-f1light/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="••••••••"
                disabled={isEngineStarting}
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                <motion.div
                    className="flex items-center gap-2 text-f1red text-sm p-3 bg-f1red/10 border border-f1red/30 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
                )}
            </AnimatePresence>


            {/* Engine Start Button */}
            <motion.button
              type="submit"
              className={`w-full relative overflow-hidden mt-6 flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-f1light transition-all ${
                isEngineStarting ? 'bg-black/50 cursor-wait' : 'bg-f1red hover:bg-f1red/80'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: isEngineStarting ? 1 : 1.02 }}
              whileTap={{ scale: isEngineStarting ? 1 : 0.98 }}
              disabled={isEngineStarting}
            >
              {isEngineStarting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-t-2 border-t-f1light border-f1light/30 rounded-full"
                  />
                  <span>STARTING SEQUENCE...</span>
                </>
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  <span>START ENGINE</span>
                </>
              )}
              {/* Pulsing glow effect on button when not starting */}
              {!isEngineStarting && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    boxShadow: '0 0 10px #DC0000',
                    pointerEvents: 'none',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.2, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-f1light/20" />
            <span className="text-f1light/60 text-sm uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-f1light/20" />
          </div>

          {/* Register Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-f1light/60 mb-3">New to the grid?</p>
            <button
              onClick={() => onNavigate('/register')}
              className="glass-light px-6 py-3 rounded-lg text-f1light font-bold hover:glass-strong transition-all hover:scale-105"
              disabled={isEngineStarting}
            >
              Join the Championship
            </button>
          </motion.div>

          {/* System Status */}
          <motion.div
            className="mt-8 pt-6 border-t border-f1light/10 flex items-center justify-between text-xs text-f1light/40 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
            <div>v2025.1</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated checkered flag pattern - Corrected SVG dimensions/positioning */}
      <div className="fixed bottom-0 left-0 right-0 h-20 opacity-10 pointer-events-none overflow-hidden">
        <svg width="2000" height="80"> 
          {[...Array(20)].map((_, i) => // 20 tiles wide
            [...Array(4)].map((_, j) => ( // 4 tiles high
              <motion.rect
                key={`${i}-${j}`}
                x={i * 100}
                y={j * 20}
                width="100"
                height="20"
                fill={(i + j) % 2 === 0 ? '#F5F5F5' : 'transparent'}
                animate={{ x: i * 100 - 100 }} // Shift pattern slightly
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} // Slow scroll
              />
            ))
          )}
        </svg>
      </div>
    </div>
  );
}