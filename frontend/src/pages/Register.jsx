import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' for 'motion'
import { User, Mail, Lock, Flag, CheckCircle, ArrowLeft, Users } from 'lucide-react'; // Added Users import



export function Register({ onNavigate, onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [lightSequence, setLightSequence] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  // Removed TypeScript type annotation <string[]>
  const [errors, setErrors] = useState([]); 
  const [isLightsOut, setIsLightsOut] = useState(false);

  // Starting lights animation
  useEffect(() => {
    // Removed NodeJS.Timeout type annotation
    let sequence = null;
    
    if (isStarting) {
      sequence = setInterval(() => {
        setLightSequence((prev) => {
          if (prev >= 5) {
            if (sequence) clearInterval(sequence);
            setTimeout(() => {
              // All lights turn red, then turn off
              setIsLightsOut(true); 
              setTimeout(() => {
                // Simulate registration completion and navigation
                if (typeof onRegister === 'function') onRegister(formData);
                if (typeof onNavigate === 'function') onNavigate('/');
              }, 1000); // Small delay after lights out
            }, 500); // 500ms delay after final light comes on
            return prev;
          }
          return prev + 1;
        });
      }, 600); // Time delay between lights turning on
    }

    return () => { if (sequence) clearInterval(sequence); };
  }, [isStarting, onRegister, onNavigate, formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Removed TypeScript type annotation : string[]
    const newErrors = [];

    if (!formData.name) newErrors.push('Driver name required');
    if (!formData.email) newErrors.push('Email address required');
    if (!formData.password) newErrors.push('Password required');
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters');
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      setIsStarting(true);
    }
  };

  // Removed TypeScript type annotations
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors only if user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-950">
      {/* F1 Starting Lights Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Starting Lights Display - Top Center */}
        <div className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            className="flex gap-4 md:gap-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {[1, 2, 3, 4, 5].map((light) => (
              <motion.div
                key={light}
                className="flex flex-col gap-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: light * 0.1 }}
              >
                {/* Light housing */}
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/60 border-4 border-gray-700 flex items-center justify-center shadow-2xl">
                    {/* Light */}
                    <AnimatePresence mode="wait">
                      {isStarting && lightSequence >= light && !isLightsOut && (
                        <motion.div
                          key={`on-${light}`}
                          className="absolute inset-2 rounded-full bg-f1red"
                          initial={{ scale: 0, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1, opacity: 1 }} // Keep visible until lights out
                          transition={{ duration: 0.2 }}
                        >
                          {/* Glow effect */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{
                              boxShadow: [
                                '0 0 20px rgba(220, 0, 0, 0.5)',
                                '0 0 40px rgba(220, 0, 0, 0.8)',
                                '0 0 20px rgba(220, 0, 0, 0.5)',
                              ],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Green light (lights out) */}
                      {isLightsOut && (
                        <motion.div
                          key="lights-out"
                          className="absolute inset-2 rounded-full bg-green-500"
                          initial={{ scale: 1, opacity: 1 }}
                          animate={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.3, delay: 0 }}
                        >
                          {/* Green glow effect when lights are out */}
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            animate={{
                              boxShadow: [
                                '0 0 30px rgba(34, 197, 94, 0.8)',
                                '0 0 50px rgba(34, 197, 94, 1)',
                                '0 0 30px rgba(34, 197, 94, 0.8)',
                              ],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Status Text */}
          <AnimatePresence mode="wait">
            {isStarting && !isLightsOut && (
              <motion.div
                key="sequence-text"
                className="text-center mt-8 text-f1red font-bold text-2xl uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Lights {lightSequence}/5
              </motion.div>
            )}
            {isLightsOut && (
              <motion.div
                key="lights-out-text"
                className="text-center mt-8 text-green-500 font-bold text-3xl uppercase tracking-wider"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                LIGHTS OUT AND AWAY WE GO! <Flag className="inline w-6 h-6 ml-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Registration Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="glass-strong rounded-2xl p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Users className="w-12 h-12 text-f1red mx-auto mb-3" />
            <h1 className="text-4xl font-extrabold text-f1light">Join the Grid</h1>
            <p className="text-f1light/60">Register your Driver Profile.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-f1light/50" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="Driver Name (e.g., Max Verstappen)"
                disabled={isStarting}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-f1light/50" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="Email address"
                disabled={isStarting}
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-f1light/50" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="Password (min 8 characters)"
                disabled={isStarting}
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="relative"
            >
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-f1light/50" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange('confirmPassword', e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="Confirm Password"
                disabled={isStarting}
              />
            </motion.div>

            {/* Errors */}
            <AnimatePresence>
              {errors.length > 0 && (
                <motion.div
                  className="space-y-2 pt-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.map((err, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 text-f1red text-sm p-2 bg-f1red/10 border border-f1red/30 rounded"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Lock className="w-4 h-4" />
                      {err}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full relative overflow-hidden group mt-6 flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-lg text-f1light bg-f1red hover:bg-f1red/80 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              disabled={isStarting}
              whileHover={{ scale: isStarting ? 1 : 1.02 }}
              whileTap={{ scale: isStarting ? 1 : 0.98 }}
            >
              {isStarting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-t-2 border-t-f1light border-f1light/30 rounded-full"
                  />
                  <span>AWAITING SIGNAL...</span>
                </>
              ) : (
                <>
                  <Flag className="w-5 h-5" />
                  <span>START YOUR ENGINE</span>
                </>
              )}
              {/* Button shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-200%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'linear',
                }}
              />
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-f1light/20" />
            <span className="text-f1light/60 text-sm">OR</span>
            <div className="flex-1 h-px bg-f1light/20" />
          </div>

          {/* Login Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-f1light/60 mb-3">Already on the grid?</p>
            <button
              onClick={() => onNavigate('/login')}
              className="glass-light px-6 py-3 rounded-lg text-f1light font-bold hover:glass-strong transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              disabled={isStarting}
            >
              <ArrowLeft className="w-4 h-4" /> Sign In to Your Account
            </button>
          </motion.div>

          {/* Terms */}
          <motion.p
            className="text-center text-xs text-f1light/40 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </motion.div>
      </div>

      {/* Checkered flag pattern bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-16 opacity-10 pointer-events-none overflow-hidden">
        <svg width="2000" height="64">
          {[...Array(40)].map((_, i) =>
            [...Array(3)].map((_, j) => (
              <rect
                key={`${i}-${j}`}
                x={i * 50}
                y={j * 16}
                width="50"
                height="16"
                fill={(i + j) % 2 === 0 ? '#F5F5F5' : 'transparent'}
              />
            ))
          )}
        </svg>
      </div>
    </div>
  );
}