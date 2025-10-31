import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' for 'motion'
import { ArrowLeft, Trophy, MapPin, User, Cog, Calendar, Users } from 'lucide-react';
// Assuming ImageWithFallback is defined elsewhere and works as intended
// import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// --- MOCK DATA/COMPONENTS (Interfaces removed) ---
// The data shape is now inferred by JavaScript based on the constant arrays.

const drivers = [
  { id: 1, name: "Max Verstappen", number: 1, nationality: "Dutch", points: 450, wins: 14, championships: 3 },
  { id: 2, name: "Sergio Perez", number: 11, nationality: "Mexican", points: 280, wins: 2, championships: 0 },
  { id: 3, name: "Lewis Hamilton", number: 44, nationality: "British", points: 250, wins: 0, championships: 7 },
  { id: 4, name: "George Russell", number: 63, nationality: "British", points: 220, wins: 0, championships: 0 },
  { id: 5, name: "Charles Leclerc", number: 16, nationality: "Monegasque", points: 200, wins: 1, championships: 0 },
];

const teams = [
  { 
    id: "RBR", 
    name: "Red Bull Racing", 
    color: "#0600EF", 
    base: "Milton Keynes, UK", 
    championships: 6, 
    technicalDirector: "Adrian Newey", 
    drivers: [1, 2] 
  },
  { 
    id: "MER", 
    name: "Mercedes AMG F1", 
    color: "#00D2BE", 
    base: "Brackley, UK", 
    championships: 8, 
    technicalDirector: "Mike Elliott", 
    drivers: [3, 4] 
  },
  { 
    id: "FER", 
    name: "Scuderia Ferrari", 
    color: "#DC0000", 
    base: "Maranello, Italy", 
    championships: 16, 
    technicalDirector: "Enrico Cardile", 
    drivers: [5] 
  },
];

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);
// -------------------------------------------------------------------

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
  // Default to Red Bull if no ID is provided or found for demonstration
  const team = teams.find(t => t.id === teamId) || teams[0]; 

  if (!team) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-f1light mb-4">Team Not Found</h1>
        <button
          onClick={() => onNavigate('/teams')}
          className="bg-f1red text-f1light py-2 px-6 rounded-lg"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  // Cast drivers array implicitly to any type in JS
  const teamDrivers = drivers.filter(d => team.drivers.includes(d.id));
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
            src={`https://source.unsplash.com/1200x400/?f1,garage,pitlane,${team.id}`}
            alt={team.name}
            className="w-full h-full object-cover opacity-30"
          />
          <div
            className="absolute inset-0"
            style={{
              // Color overlay for branding
              background: `linear-gradient(to right, ${team.color}E6, ${team.color}80, transparent)`,
            }}
          />
        </div>

        <div className="relative z-10 p-8 md:p-12">
          {/* Team Logo Placeholder */}
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-4 backdrop-blur-md"
            style={{
              backgroundColor: `${team.color}40`,
              border: `2px solid ${team.color}`,
            }}
            initial={{ scale: 0, rotate: -360 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Users className="w-10 h-10 text-f1light" />
          </motion.div>

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
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Trophy className="w-6 h-6" style={{ color: team.color }} />
            {/* Animated championship stars */}
            <motion.div
              className="flex gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, staggerChildren: 0.1 }}
            >
              {[...Array(Math.min(team.championships, 8))].map((_, i) => (
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
              {team.championships} Constructor Championships
            </span>
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
              color={team.color}
              delay={0.5}
            />
            <IntelCard
              icon={User}
              label="Technical Director"
              value={team.technicalDirector}
              color={team.color}
              delay={0.6}
            />
            <IntelCard
              icon={Cog}
              label="First Entry"
              value="1954" // Mocked year
              color={team.color}
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
                  ? 'text-black' // Black text for contrasting team color background
                  : 'glass-light text-f1light/60 hover:text-f1light'
              }`}
              style={{
                backgroundColor: selectedCarYear === year ? team.color : 'transparent',
                boxShadow: selectedCarYear === year ? `0 0 10px ${team.color}80` : 'none',
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
              background: `linear-gradient(135deg, ${team.color}20, ${team.color}40)`,
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
                  src={`https://source.unsplash.com/1000x500/?f1car,modern,${team.id + selectedCarYear}`}
                  alt={`${team.name} ${selectedCarYear} Car`}
                  className="max-h-96 object-contain drop-shadow-2xl"
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
                    boxShadow: `0 0 30px ${team.color}`,
                  }}
                />

                <div className="p-6 flex items-center gap-6">
                  {/* Driver Photo */}
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden ring-4 flex-shrink-0"
                    style={{ borderColor: team.color }}
                  >
                    <ImageWithFallback
                      src={`https://source.unsplash.com/400x400/?f1driver,helmet,portrait,${driver.number}`}
                      alt={driver.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Driver Info */}
                  <div className="flex-1">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold text-f1light mb-2"
                      style={{ backgroundColor: team.color }}
                    >
                      #{driver.number}
                    </div>
                    <h3 className="text-2xl font-bold text-f1light mb-1">{driver.name}</h3>
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
                      {driver.championships > 0 && (
                        <div>
                          <div className="text-f1light/60">Championships</div>
                          <div className="text-f1red font-bold">{driver.championships}</div>
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