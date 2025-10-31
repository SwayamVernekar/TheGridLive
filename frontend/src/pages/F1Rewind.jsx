import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  Flag,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { fetchStats } from "../api/f1Api";

// Mock ImageWithFallback
const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} />
);

export function F1Rewind() {
  const [selectedLegend, setSelectedLegend] = useState(null);
  const [legendaryDrivers, setLegendaryDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLegends() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStats();
        setLegendaryDrivers(data.legendaryDrivers || []);
      } catch (err) {
        console.error('Failed to load legendary drivers:', err);
        setError('Failed to load legendary drivers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadLegends();
  }, []);

  const heroTextGradientStyle = {
    backgroundImage: "linear-gradient(to right, #DC0000 0%, #8B0000 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-f1red mb-4"></div>
          <p className="text-f1light text-xl">Loading Hall of Legends...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-strong rounded-xl p-8 text-center max-w-md"
        >
          <Trophy className="w-16 h-16 text-f1red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-f1light mb-2">Unable to Load Legends</h2>
          <p className="text-f1light/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-f1red text-white rounded-lg hover:bg-f1red/80 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative z-10">
          <h1
            className="text-7xl md:text-9xl font-extrabold tracking-tight"
            style={heroTextGradientStyle}
          >
            Hall of Legends
          </h1>
          <p className="text-f1light/80 text-xl max-w-3xl font-serif italic">
            "A digital museum dedicated to the immortal champions who defined Formula 1"
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedLegend ? (
          /* Legend Details Page */
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Back Button */}
            <motion.button
              onClick={() => setSelectedLegend(null)}
              className="flex items-center gap-2 text-f1red hover:text-f1red/80 transition-colors"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Hall of Legends
            </motion.button>

            {/* Hero Section with Photo */}
            <motion.div
              className="glass-strong rounded-xl overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative w-full h-96">
                <ImageWithFallback
                  src={`https://source.unsplash.com/1200x400/?racing,motorsport,${selectedLegend.id}`}
                  alt={selectedLegend.name}
                  className="w-full h-full object-cover grayscale sepia"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-f1light/80 text-sm font-serif italic">
                    "{selectedLegend.quote}"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Trophy, label: "Championships", value: selectedLegend.championships },
                { icon: Flag, label: "Wins", value: selectedLegend.wins },
                { icon: Zap, label: "Poles", value: selectedLegend.poles },
                { icon: Award, label: "Podiums", value: selectedLegend.podiums },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="glass-strong rounded-xl p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <stat.icon className="w-8 h-8 text-f1red mx-auto mb-2" />
                  <p className="text-f1light/60 text-sm">{stat.label}</p>
                  <p className="text-f1light text-3xl font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Defining Moment (if available) */}
            {selectedLegend.definingMoment && (
              <motion.div
                className="glass-strong rounded-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-2xl font-bold text-f1light mb-4">Defining Moment</h3>
                <h4 className="text-f1red text-xl font-semibold mb-2">
                  {selectedLegend.definingMoment.title}
                </h4>
                <p className="text-f1light/80 mb-4">{selectedLegend.definingMoment.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="glass-strong px-3 py-1 rounded-full text-f1light">
                    Position: {selectedLegend.definingMoment.position}
                  </span>
                  <span className="glass-strong px-3 py-1 rounded-full text-f1light">
                    Year: {selectedLegend.definingMoment.year}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Rivalries (if available) */}
            {selectedLegend.rivalries && selectedLegend.rivalries.length > 0 && (
              <motion.div
                className="glass-strong rounded-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h3 className="text-2xl font-bold text-f1light mb-4">Epic Rivalries</h3>
                <div className="space-y-4">
                  {selectedLegend.rivalries.map((rivalry, idx) => (
                    <div key={idx} className="border-l-4 border-f1red pl-4">
                      <h4 className="text-f1red text-lg font-semibold">vs. {rivalry.rival}</h4>
                      <p className="text-f1light/60 text-sm italic mb-2">{rivalry.battles}</p>
                      <p className="text-f1light/80">{rivalry.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Legends Grid */
          <motion.div
            key="grid"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {legendaryDrivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                className="glass-strong rounded-xl overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedLegend(driver)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/400x400/?racing,formula1,vintage,portrait,${driver.id}`}
                    alt={driver.name}
                    className="w-full h-full object-cover grayscale group-hover:sepia transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute top-4 left-4 glass-strong px-3 py-1 rounded-full">
                    <p className="text-f1light text-sm font-serif">{driver.era}</p>
                  </div>
                  <div className="absolute top-4 right-4 glass-strong px-3 py-1 rounded-full flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-f1red" />
                    <p className="text-f1light font-bold">{driver.championships}×</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-f1light mb-2 group-hover:text-f1red transition-colors">
                    {driver.name}
                  </h3>
                  <p className="text-f1light/60 font-serif italic mb-4">{driver.nationality}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-f1light/60">Wins</p>
                      <p className="text-f1light font-bold text-lg">{driver.wins}</p>
                    </div>
                    <div>
                      <p className="text-f1light/60">Poles</p>
                      <p className="text-f1light font-bold text-lg">{driver.poles}</p>
                    </div>
                  </div>

                  <motion.div className="mt-4 text-f1red text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Legacy</span>
                    <span>→</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
