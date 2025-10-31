import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'
import { Trophy, Medal, Award, Star, Target, Zap, Crown, TrendingUp } from 'lucide-react';
import { fetchStats } from '../api/f1Api';

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

const badges = [
  { id: 'podium-prophet', name: 'Podium Prophet', icon: Crown, description: 'Correctly predict the podium 3 times in a row.', unlocked: true },
  { id: 'perfect-prediction', name: 'Perfect Predictor', icon: Target, description: 'Get all top 10 positions correct.', unlocked: false },
  { id: 'streak-master', name: 'Streak Master', icon: Zap, description: 'Participate in 5 consecutive races.', unlocked: true },
  { id: 'top-scorer', name: 'Top Scorer', icon: Award, description: 'Achieve 150+ points in a single race week.', unlocked: true },
  { id: 'underdog-champion', name: 'Underdog Champ', icon: Medal, description: 'Predict a non-top-3 team on the podium.', unlocked: false },
  { id: 'consistency-king', name: 'Consistency King', icon: TrendingUp, description: 'Score points in every race this season.', unlocked: false },
];

const leaderboard = [
  { rank: 1, name: "RacerMax44", points: 1580, avatar: 'avatar1' },
  { rank: 2, name: "F1Fanatic_21", points: 1450, avatar: 'avatar2' },
  { rank: 3, name: "PodiumBoss", points: 1405, avatar: 'avatar3' },
  { rank: 4, name: "TurboTom", points: 1350, avatar: 'avatar4' },
  { rank: 5, name: "TheProfessor", points: 1301, avatar: 'avatar5' },
];

export function PodiumPredictor() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([
    { position: 1, driver: null },
    { position: 2, driver: null },
    { position: 3, driver: null },
  ]);
  
  const [userPoints, setUserPoints] = useState(1247);
  const [globalRank, setGlobalRank] = useState(42);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadDrivers() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStats();
        setDrivers(data.drivers || []);
      } catch (err) {
        console.error('Failed to load drivers:', err);
        setError('Failed to load drivers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadDrivers();
  }, []);

  const handleDriverSelect = (driver, position) => {
    // Check if the driver is already selected
    const existingPrediction = predictions.find((p) => p.driver?.id === driver.id);
    
    if (existingPrediction) {
      // Logic for swapping: find the slot the current driver occupies (existingPosition)
      const existingPosition = existingPrediction.position;
      
      setPredictions((prev) =>
        prev.map((p) => {
          if (p.position === existingPosition) {
            // Move the driver currently at the target position to the existing driver's old position
            const targetDriver = prev.find((pred) => pred.position === position)?.driver || null;
            return { ...p, driver: targetDriver };
          }
          if (p.position === position) {
            // Move the selected driver to the target position
            return { ...p, driver };
          }
          return p;
        })
      );
    } else {
      // Simple assignment if the driver isn't selected anywhere else
      setPredictions((prev) =>
        prev.map((p) => (p.position === position ? { ...p, driver } : p))
      );
    }
  };

  const submitPrediction = () => {
    if (predictions.every((p) => p.driver !== null)) {
      setSubmitted(true);
      // Simulate earning points
      setTimeout(() => {
        setUserPoints((prev) => prev + 50);
      }, 1000);
    }
  };

  const resetPredictions = () => {
    setPredictions([
      { position: 1, driver: null },
      { position: 2, driver: null },
      { position: 3, driver: null },
    ]);
    setSubmitted(false);
  };

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-f1red mb-4"></div>
          <p className="text-f1light text-xl">Loading drivers...</p>
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
          <h2 className="text-2xl font-bold text-f1light mb-2">Unable to Load Drivers</h2>
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
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-f1light">Podium Predictor</h1>
        <p className="text-f1light/60">Predict the top 3 for the **US Grand Prix**!</p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="glass-strong rounded-xl p-6 grid grid-cols-3 gap-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-4 justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-f1light/60 text-sm uppercase">Your Points</div>
            <motion.div
              className="text-3xl font-bold text-f1light"
              key={userPoints} // Key to trigger animation on update
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {userPoints}
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-f1blue to-blue-800 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-f1light" />
          </div>
          <div>
            <div className="text-f1light/60 text-sm uppercase">Global Rank</div>
            <div className="text-3xl font-bold text-f1light">#{globalRank}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Star className="w-8 h-8 text-yellow-900" />
          </div>
          <div>
            <div className="text-f1light/60 text-sm uppercase">Badges Unlocked</div>
            <div className="text-3xl font-bold text-f1light">
              {badges.filter((b) => b.unlocked).length}/{badges.length}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Prediction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Race Info */}
          <motion.div
            className="glass-strong rounded-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-f1light mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-f1red" /> Podium Picks
            </h2>

            {/* Prediction Slots */}
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.position}
                  className="glass-light rounded-lg p-6 relative overflow-hidden"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  {/* Background color flash for emphasis */}
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundColor: podiumColors[index] }}
                    initial={{ opacity: 0.1 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  />

                  <div className="flex items-center gap-6 ml-4">
                    {/* Position badge */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-black"
                        style={{ backgroundColor: podiumColors[index] }}
                      >
                        P{prediction.position}
                      </div>
                    </div>

                    {/* Driver selection or info */}
                    {prediction.driver ? (
                      <motion.div
                        className="flex-1 flex items-center gap-4"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <div
                          className="w-12 h-12 rounded-full overflow-hidden ring-2"
                          style={{ borderColor: prediction.driver.teamColor, boxShadow: `0 0 10px ${prediction.driver.teamColor}80` }}
                        >
                          <ImageWithFallback
                            src={`https://source.unsplash.com/200x200/?racer,helmet,professional,${prediction.driver.number}`}
                            alt={prediction.driver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-xl font-bold text-f1light">{prediction.driver.name}</div>
                          <div className="text-f1light/60 text-sm">{prediction.driver.team}</div>
                        </div>
                        <motion.button
                          className="text-f1red hover:text-f1red/80"
                          onClick={() => handleDriverSelect(prediction.driver, prediction.position)}
                          whileHover={{ scale: 1.1 }}
                        >
                          Change
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="flex-1 text-f1light/60">
                        Select a driver from the list →
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Submit Button */}
            {!submitted && (
              <motion.button
                type="button" // Use type button to prevent form submission if not in a form
                className={`w-full mt-6 py-4 rounded-lg font-bold text-lg transition-all ${
                  predictions.every((p) => p.driver !== null)
                    ? 'bg-f1red text-f1light hover:bg-f1red/80'
                    : 'glass-light text-f1light/50 cursor-not-allowed'
                }`}
                onClick={submitPrediction}
                disabled={!predictions.every((p) => p.driver !== null)}
                whileHover={predictions.every((p) => p.driver !== null) ? { scale: 1.02 } : {}} 
                whileTap={predictions.every((p) => p.driver !== null) ? { scale: 0.98 } : {}} 
              >
                Submit Prediction
              </motion.button>
            )}

            {submitted && (
              <motion.div
                className="mt-6 glass-light rounded-lg p-6 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <Trophy className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-f1light">Prediction Locked!</h3>
                <p className="text-f1light/60">Good luck! You'll earn points after the race.</p>
                <motion.button
                  className="mt-4 text-f1red hover:text-f1red/80"
                  onClick={resetPredictions}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset Predictions (FOR DEMO)
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Available Drivers */}
          <motion.div
            className="glass-strong rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-f1light mb-4">Available Drivers</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {drivers.slice(0, 8).map((driver, index) => {
                const isSelected = predictions.some((p) => p.driver?.id === driver.id);
                return (
                  <motion.div
                    key={driver.id}
                    className={`glass-light rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected ? 'opacity-50 pointer-events-none' : 'hover:scale-105'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                    onClick={() => {
                      const emptySlot = predictions.find((p) => p.driver === null);
                      if (emptySlot) {
                        handleDriverSelect(driver, emptySlot.position);
                      }
                    }}
                    whileTap={{ scale: isSelected ? 1 : 0.95 }}
                  >
                    <div
                      className="w-full aspect-square rounded mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${driver.teamColor}20` }}
                    >
                      <ImageWithFallback
                        src={`https://source.unsplash.com/300x300/?racer,helmet,face,${driver.number}`}
                        alt={driver.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="text-f1light font-bold text-xs text-center truncate">
                      {driver.name.split(' ').pop()}
                    </div>
                    <div className="text-f1light/60 text-xs text-center truncate">
                      {driver.team.split(' ')[0]}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <motion.div
            className="glass-strong rounded-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-f1light mb-4">Global Leaderboard</h2>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  className="glass-light rounded-lg p-3 flex items-center gap-3 justify-between"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold ${entry.rank <= 3 ? 'text-black' : 'text-f1light'}`} 
                         style={{ backgroundColor: entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : entry.rank === 3 ? '#CD7F32' : 'transparent' }}>
                         {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-f1light font-bold truncate">{entry.name}</div>
                      <div className="text-f1light/60 text-xs">{entry.points} pts</div>
                    </div>
                  </div>
                  <div className="text-f1red font-bold">#{entry.rank}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            className="glass-strong rounded-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-f1light mb-4">Your Achievements</h2>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.id}
                    className={`glass-light rounded-lg p-3 text-center ${
                      badge.unlocked ? '' : 'opacity-50 grayscale'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${badge.unlocked ? 'text-yellow-400' : 'text-f1light/30'}`} />
                    <div className="text-f1light font-bold text-sm">{badge.name}</div>
                    <div className="text-f1light/60 text-xs line-clamp-2">{badge.description}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}