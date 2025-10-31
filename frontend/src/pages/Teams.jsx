import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' for 'motion'
import { Award, Trophy, TrendingUp, Users } from 'lucide-react';
// Assuming ImageWithFallback is defined elsewhere and works as intended
// import { ImageWithFallback } from '../components/figma/ImageWithFallback';

// --- MOCK DATA/COMPONENTS (Interfaces removed) ---
// Data shapes are defined implicitly in the constants below.

const teams = [
  { id: 1, name: "Red Bull Racing", color: "#0600EF", points: 730, wins: 18 },
  { id: 2, name: "Mercedes AMG F1", color: "#00D2BE", points: 390, wins: 0 },
  { id: 3, name: "Scuderia Ferrari", color: "#DC0000", points: 380, wins: 1 },
  { id: 4, name: "McLaren", color: "#FF8700", points: 300, wins: 0 },
  { id: 5, name: "Aston Martin", color: "#006F62", points: 200, wins: 0 },
];
const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);
// -------------------------------------------------------------------


export function Teams({ onNavigate }) {
  // Removed TypeScript type annotation <number | null>
  const [hoveredCard, setHoveredCard] = useState(null); 
  
  const maxPoints = Math.max(...teams.map(t => t.points));
  const maxWins = Math.max(...teams.map(t => t.wins));

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-f1light mb-2">F1 Teams</h1>
        <p className="text-f1light/60">All constructor teams competing in the 2025 season</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            className="glass-strong rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            
            // Simplified 3D-like hover transformation for reliability
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
            
            onHoverStart={() => setHoveredCard(team.id)}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => onNavigate?.(`/team/${team.id}`)}
          >
            {/* Team color accent top */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${team.color}, transparent)`,
                boxShadow: `0 0 10px ${team.color}`,
              }}
            />

            {/* Glowing border on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredCard === team.id ? 1 : 0 }} // Corrected conditional animation
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: `0 0 30px ${team.color}`,
              }}
            />

            <div className="p-6 relative z-10">
              {/* Team Car Image */}
              <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${team.color}20, ${team.color}40)`,
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src={`https://source.unsplash.com/600x400/?f1car,racing,speed,${team.id}`}
                    alt={team.name}
                    className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                  />
                </motion.div>
                
                {/* Podium indicator for top 3 */}
                {index < 3 && (
                  <motion.div
                    className="absolute bottom-2 right-2 bg-f1red rounded-full p-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                  >
                    <Trophy className="w-5 h-5 text-f1light" />
                  </motion.div>
                )}
              </div>

              {/* Team Name */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <motion.div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: team.color }}
                  animate={{ 
                    boxShadow: hoveredCard === team.id ? `0 0 15px ${team.color}` : 'none', // Corrected conditional box shadow
                  }}
                  transition={{ duration: 0.3 }}
                />
                <h3 className="text-xl font-bold text-f1light">{team.name}</h3>
              </div>

              {/* Animated Stats */}
              <div className="space-y-4 mb-4">
                {/* Points with radial progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-f1red" />
                      <span className="text-f1light/80 text-sm">Points</span>
                    </div>
                    <span className="font-bold text-f1red">{team.points}</span>
                  </div>
                  <div className="h-2 bg-f1dark rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${team.color}, #DC0000)`,
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${(team.points / maxPoints) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Wins with radial progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-f1red" />
                      <span className="text-f1light/80 text-sm">Race Wins</span>
                    </div>
                    <span className="font-bold text-f1red">{team.wins}</span>
                  </div>
                  <div className="h-2 bg-f1dark rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${team.color}, #00D2BE)`,
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${(team.wins / maxWins) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                  </div>
                </div>
              </div>

              {/* View Details Button */}
              <motion.button
                className="w-full flex items-center justify-center gap-2 mt-4 py-2 rounded-lg bg-f1red text-f1light font-bold hover:bg-f1red/80 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                // onClick handler is handled by the parent motion.div
              >
                <Users className="w-4 h-4" />
                View Team Details
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}