import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Calendar, ArrowRight, Tv, Clock, MapPin } from 'lucide-react';

export function Live() {
  const [nextRace, setNextRace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch next race from backend
  useEffect(() => {
    const fetchNextRace = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/data/schedule`);
        if (response.ok) {
          const data = await response.json();
          setNextRace(data.nextRace);
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNextRace();
  }, []);

  const handleGoToSchedule = () => {
    window.location.href = '#/schedule';
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-f1red"
        >
          <Radio className="w-16 h-16" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 -left-32 w-96 h-96 bg-f1red rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl"
          />
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Pulsing TV icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 0px rgba(220, 0, 0, 0)',
                '0 0 60px rgba(220, 0, 0, 0.6)',
                '0 0 0px rgba(220, 0, 0, 0)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <Tv className="w-32 h-32 text-f1red" strokeWidth={1.5} />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -top-2 -right-2"
              >
                <Radio className="w-12 h-12 text-f1red" />
              </motion.div>
            </div>
          </motion.div>

          {/* Main message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-7xl font-black text-f1light mb-6 tracking-tight">
              NO LIVE
              <span className="block text-f1red mt-2">RACE TODAY</span>
            </h1>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-2xl text-f1light/70 font-light">
                The track is silent... for now
              </p>
            </motion.div>
          </motion.div>

          {/* Next race card */}
          {nextRace ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="glass-strong rounded-2xl p-8 mb-8 backdrop-blur-xl border border-f1light/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-f1red" />
                <h2 className="text-2xl font-bold text-f1light">Next Race</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-black text-f1light mb-4">
                  {nextRace.raceName}
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-f1light/80">
                    <MapPin className="w-5 h-5 text-f1red flex-shrink-0" />
                    <span className="text-lg">
                      {nextRace.locality}, {nextRace.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-f1light/80">
                    <Clock className="w-5 h-5 text-f1red flex-shrink-0" />
                    <span className="text-lg">
                      {new Date(nextRace.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="glass-strong rounded-2xl p-8 mb-8 backdrop-blur-xl border border-f1light/10 text-center"
            >
              <p className="text-xl text-f1light/60">
                Stay tuned for upcoming race announcements
              </p>
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={handleGoToSchedule}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(220, 0, 0, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-5 bg-gradient-to-r from-f1red to-red-700 rounded-xl font-bold text-xl text-f1light shadow-2xl overflow-hidden"
            >
              <motion.div
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              <span className="relative flex items-center gap-3">
                View Full Schedule
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </motion.button>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-12 flex justify-center gap-4"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
                className="w-2 h-8 bg-f1red rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
