import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' for 'motion'
import { X, Check, Trophy, Users } from 'lucide-react'; // Added Trophy, Users

// --- MOCK DATA/COMPONENTS (Interfaces removed) ---
const drivers = [
  { id: 1, name: "Max Verstappen", team: "Red Bull Racing", teamColor: "#0600EF", number: 1, championships: 3 },
  { id: 2, name: "Lewis Hamilton", team: "Mercedes AMG F1", teamColor: "#00D2BE", number: 44, championships: 7 },
  { id: 3, name: "Charles Leclerc", team: "Scuderia Ferrari", teamColor: "#DC0000", number: 16, championships: 0 },
  { id: 4, name: "Lando Norris", team: "McLaren", teamColor: "#FF8700", number: 4, championships: 0 },
  { id: 5, name: "Fernando Alonso", team: "Aston Martin", teamColor: "#006F62", number: 14, championships: 2 },
  { id: 6, name: "Sergio Perez", team: "Red Bull Racing", teamColor: "#0600EF", number: 11, championships: 0 },
  { id: 7, name: "George Russell", team: "Mercedes AMG F1", teamColor: "#00D2BE", number: 63, championships: 0 },
  { id: 8, name: "Carlos Sainz", team: "Scuderia Ferrari", teamColor: "#DC0000", number: 55, championships: 0 },
];

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);
// -------------------------------------------------------------------

export function FavoriteDriverModal({ isOpen, onSelect }) {
  // Removed TypeScript type annotation <Driver | null>
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleConfirm = () => {
    if (selectedDriver) {
      if (typeof onSelect === 'function') {
        onSelect(selectedDriver);
      }
    }
  };

  // Constants for motion
  const motionDuration = 0.3;
  const pulseDuration = 1.5;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration }}
          />

          {/* Modal */}
          <motion.div
            className="relative glass-strong rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -50 }}
            transition={{ duration: 0.4, type: 'spring', damping: 20 }}
          >
            {/* Close Button (Mock functionality) */}
            <motion.button
                onClick={() => onSelect(null)} // Simulate close/cancel
                className="absolute top-4 right-4 p-2 rounded-full glass-light text-f1light hover:text-f1red transition-colors z-10"
                whileHover={{ rotate: 90 }}
            >
                <X className="w-6 h-6" />
            </motion.button>
            
            {/* Header */}
            <div className="text-center mb-8 relative">
              <motion.div
                className="absolute left-1/2 top-0 -translate-x-1/2 w-10 h-10 text-f1red opacity-30"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                }}
              >
                <Users className="w-full h-full" />
              </motion.div>
              <h2 className="text-4xl font-bold text-f1light mb-2">
                Choose Your Race Engineer
              </h2>
              <p className="text-f1light/80">
                Select your favorite driver to personalize your dashboard
              </p>
            </div>

            {/* Driver Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {drivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  className={`relative glass-light rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDriver?.id === driver.id ? 'ring-4' : ''
                  }`}
                  style={{
                    // Corrected ringColor assignment
                    borderColor: selectedDriver?.id === driver.id ? driver.teamColor : 'transparent',
                    ringColor: selectedDriver?.id === driver.id ? driver.teamColor : 'transparent',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedDriver(driver)}
                >
                  {/* Selected indicator */}
                  <AnimatePresence>
                    {selectedDriver?.id === driver.id && (
                      <motion.div
                        className="absolute -top-2 -right-2 rounded-full p-1 z-20"
                        style={{ backgroundColor: driver.teamColor }}
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1, transition: { type: 'spring', stiffness: 500 } }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Check className="w-4 h-4 text-black" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Team color bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                    style={{ backgroundColor: driver.teamColor }}
                  />

                  {/* Driver photo */}
                  <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-transparent">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: `${driver.teamColor}40` }}
                    />
                    <ImageWithFallback
                      src={`https://source.unsplash.com/400x400/?f1,helmet,professional,${driver.number}`}
                      alt={driver.name}
                      className="w-full h-full object-cover relative z-10"
                    />
                  </div>

                  {/* Driver number badge */}
                  <div
                    className="inline-block px-2 py-1 rounded text-xs font-bold text-f1light mb-2"
                    style={{ backgroundColor: driver.teamColor }}
                  >
                    #{driver.number}
                  </div>

                  {/* Driver info */}
                  <h3 className="text-f1light font-bold text-sm mb-1 line-clamp-2">
                    {driver.name}
                  </h3>
                  <p className="text-f1light/60 text-xs truncate">{driver.team}</p>

                  {/* Championships indicator */}
                  {driver.championships > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[...Array(Math.min(driver.championships, 3))].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full bg-yellow-400"
                          title={`${driver.championships}x World Champion`}
                        />
                      ))}
                      {driver.championships > 3 && (
                        <span className="text-xs text-yellow-400 font-bold ml-1">
                          +{driver.championships - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <motion.button
                className="bg-f1red text-f1light py-3 px-8 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-f1red/80 transition-colors"
                // Corrected conditional whileHover/whileTap
                whileHover={{ scale: selectedDriver ? 1.05 : 1 }} 
                whileTap={{ scale: selectedDriver ? 0.98 : 1 }} 
                onClick={handleConfirm}
                disabled={!selectedDriver}
              >
                <Check className="w-5 h-5" />
                Confirm Selection
              </motion.button>
            </div>

            {/* Selected driver preview */}
            <AnimatePresence mode="wait">
              {selectedDriver && (
                <motion.div
                  className="mt-6 glass-light rounded-lg p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Trophy className="w-6 h-6 text-f1red mx-auto mb-2" />
                  <p className="text-f1light/80 text-sm">
                    You've selected{' '}
                    <span className="font-bold" style={{ color: selectedDriver.teamColor }}>
                      {selectedDriver.name}
                    </span>{' '}
                    as your favorite!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}