import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, MapPin, User, Cog, Calendar, Users, Loader2 } from 'lucide-react';
import { fetchTeamDetails } from '../api/f1Api';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { getTeamImage, getCarImage, getDriverImage } from '../utils/imageUtils';

// Intel Card Component 
function IntelCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      className="glass-light rounded-lg p-6 relative overflow-hidden group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="flex items-center gap-4">
        <Icon className="w-8 h-8 flex-shrink-0" style={{ color: color }} />
        <div>
          <div className="text-f1light/60 text-sm uppercase">{label}</div>
          <div className="text-xl font-bold text-f1light">{value}</div>
        </div>
      </div>
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.05, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.div>
  );
}

export function TeamDetails({ teamId, onNavigate }) {
  const [selectedCarYear, setSelectedCarYear] = useState(2025);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeamDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchTeamDetails(teamId);

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.team) {
          throw new Error('Team not found');
        }

        setTeam(response.team);
      } catch (err) {
        console.error('Error loading team details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      loadTeamDetails();
    }
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-f1light mb-4">Team Not Found</h1>
        <p className="text-f1light/60 mb-6">{error || 'Unable to load team details'}</p>
        <button
          onClick={() => onNavigate('/teams')}
          className="bg-f1red text-f1light py-2 px-6 rounded-lg hover:bg-f1red/80 transition-colors"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  const teamDrivers = team.drivers || [];
  const carYears = [2021, 2022, 2023, 2024, 2025];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.button
        onClick={() => onNavigate('/teams')}
        className="flex items-center gap-2 text-f1red hover:text-f1red/80 transition-colors"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Teams
      </motion.button>

      {/* Hero Section */}
      <motion.div
        className="glass-strong rounded-xl relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 h-96">
          <ImageWithFallback
            src={getTeamImage(team.id)}
            alt={team.name}
            className="w-full h-full object-cover opacity-30"
            type="team"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, #${team.teamColor}E6, #${team.teamColor}80, transparent)`,
            }}
          />
        </div>

        <div className="relative z-10 p-8 md:p-12">
          {/* Team Logo */}
          {team.teamLogo && (
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4 backdrop-blur-md p-4"
              style={{
                backgroundColor: `#${team.teamColor}40`,
                border: `2px solid #${team.teamColor}`,
              }}
              initial={{ scale: 0, rotate: -360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <ImageWithFallback 
                src={team.teamLogo} 
                alt={team.name} 
                className="w-full h-full object-contain"
                type="team"
              />
            </motion.div>
          )}

          {/* Team Name */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-f1light mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {team.name}
          </motion.h1>

          {/* Championships */}
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Trophy className="w-6 h-6" style={{ color: `#${team.teamColor}` }} />
            {/* Animated championship stars */}
            <motion.div
              className="flex gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
            >
              {[...Array(Math.min(team.championships || 0, 8))].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                >
                  <Trophy className="w-4 h-4 text-yellow-900" />
                </motion.div>
              ))}
            </motion.div>
            <span className="text-f1light/80 text-lg ml-2">
              {team.championships || 0} Constructor Championships
            </span>
          </motion.div>

          {/* Current Season Stats */}
          <motion.div
            className="flex flex-wrap gap-4 text-f1light/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-f1red" />
              <span>Position: #{team.position}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>Points: {team.points}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>Wins: {team.wins}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>•</span>
              <span>Podiums: {team.podiums || 0}</span>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <IntelCard
              icon={MapPin}
              label="Team Base"
              value={team.base}
              color={`#${team.teamColor}`}
              delay={0.5}
            />
            <IntelCard
              icon={User}
              label="Technical Director"
              value={team.technicalDirector}
              color={`#${team.teamColor}`}
              delay={0.6}
            />
            <IntelCard
              icon={Calendar}
              label="First Entry"
              value={team.firstEntry}
              color={`#${team.teamColor}`}
              delay={0.7}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Car Evolution */}
      <motion.div
        className="glass-strong rounded-lg p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-f1light mb-4">Car Evolution</h2>
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {carYears.map((year) => (
            <motion.button
              key={year}
              onClick={() => setSelectedCarYear(year)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                selectedCarYear === year
                  ? 'text-black'
                  : 'glass-light text-f1light/60 hover:text-f1light'
              }`}
              style={{
                backgroundColor: selectedCarYear === year ? `#${team.teamColor}` : 'transparent',
                boxShadow: selectedCarYear === year ? `0 0 10px #${team.teamColor}80` : 'none',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {year}
            </motion.button>
          ))}
        </div>

        {/* Car Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCarYear}
            className="relative aspect-video rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, #${team.teamColor}20, #${team.teamColor}40)`,
            }}
            initial={{ opacity: 0, x: -50, rotateY: 90 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: 50, rotateY: -90 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center w-full h-full p-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 50 }}
              >
                <ImageWithFallback
                  src={team.carImage || getCarImage(team.id, selectedCarYear)}
                  alt={`${team.name} ${selectedCarYear} Car`}
                  className="max-h-96 object-contain drop-shadow-2xl"
                  type="car"
                />
              </motion.div>
            </div>
            
            {/* Year Badge */}
            <div className="absolute top-4 right-4 glass-strong px-6 py-3 rounded-lg">
              <div className="text-f1light/60 text-xs uppercase mb-1">Season</div>
              <div className="text-3xl font-bold text-f1light">{selectedCarYear}</div>
            </div>

            {/* Animated speed lines */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-0 h-0.5 bg-gradient-to-r from-transparent via-f1light/30 to-transparent"
                style={{ top: `${20 + i * 15}%`, width: '100%' }}
                initial={{ x: -100 }}
                animate={{ x: 100 }}
                transition={{
                  duration: 2 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'linear',
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Driver Lineup */}
      {teamDrivers.length > 0 && (
        <motion.div
          className="glass-strong rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-f1light mb-6">Current Driver Lineup</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {teamDrivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                className="glass-light rounded-lg overflow-hidden cursor-pointer group relative"
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onNavigate(`/driver/${driver.id}`)}
              >
                {/* Glowing border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    boxShadow: `0 0 30px #${team.teamColor}`,
                  }}
                />

                <div className="p-6 flex items-center gap-6">
                  {/* Driver Photo */}
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden ring-4 flex-shrink-0"
                    style={{ borderColor: `#${team.teamColor}` }}
                  >
                    <ImageWithFallback
                      src={driver.driverImage || getDriverImage(driver.driverId || driver.driverCode)}
                      alt={driver.fullName}
                      className="w-full h-full object-cover"
                      type="driver"
                    />
                  </div>

                  {/* Driver Info */}
                  <div className="flex-1">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold text-f1light mb-2"
                      style={{ backgroundColor: `#${team.teamColor}` }}
                    >
                      #{driver.number}
                    </div>
                    <h3 className="text-2xl font-bold text-f1light mb-1">{driver.fullName}</h3>
                    <div className="text-f1light/60 text-sm mb-3">{driver.nationality}</div>
                    
                    {/* Quick Stats */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <div className="text-f1light/60">Points</div>
                        <div className="text-f1red font-bold">{driver.points}</div>
                      </div>
                      <div>
                        <div className="text-f1light/60">Wins</div>
                        <div className="text-f1red font-bold">{driver.wins}</div>
                      </div>
                      {driver.podiums > 0 && (
                        <div>
                          <div className="text-f1light/60">Podiums</div>
                          <div className="text-f1red font-bold">{driver.podiums}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="text-f1light/40 group-hover:text-f1red transition-colors"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowLeft className="w-6 h-6 rotate-180" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}