import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, TrendingUp, Users, Loader2 } from 'lucide-react';
import { fetchTeams } from '../api/f1Api';

const ImageWithFallback = ({ src, alt, className, onError }) => (
  <img src={src} alt={alt} className={className} loading="lazy" onError={onError} />
);

export function Teams({ onNavigate }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchTeams();
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (!response.teams || response.teams.length === 0) {
          throw new Error('No teams data available for this season');
        }
        
        // Sort teams by position
        const sortedTeams = response.teams.sort((a, b) => a.position - b.position);
        setTeams(sortedTeams);
      } catch (err) {
        console.error('Error loading teams:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Error Loading Teams</h3>
        <p className="text-f1light/80">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-f1red text-white rounded hover:bg-f1red/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxPoints = Math.max(...teams.map(t => t.points || 0), 1);
  const maxWins = Math.max(...teams.map(t => t.wins || 0), 1);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-f1light mb-2">F1 Teams</h1>
        <p className="text-f1light/60">All constructor teams competing in the {new Date().getFullYear()} season</p>
        <p className="text-f1light/40 text-sm mt-1">{teams.length} teams</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {teams.map((team, index) => (
          <motion.div
            key={team.id}
            className="glass-strong rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            onMouseEnter={() => setHoveredCard(team.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onNavigate?.(`/team/${team.id}`)}
          >
            {/* Team color accent top */}
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ 
                background: `linear-gradient(90deg, transparent, #${team.teamColor}, transparent)`,
                boxShadow: `0 0 10px #${team.teamColor}`,
              }}
            />

            {/* Glowing border on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredCard === team.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: `0 0 30px #${team.teamColor}`,
              }}
            />

            <div className="p-6 relative z-10">
              {/* Team Car Image */}
              <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: `linear-gradient(135deg, #${team.teamColor}20, #${team.teamColor}40)`,
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <ImageWithFallback
                    src={team.carImage}
                    alt={`${team.name} F1 Car`}
                    className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </motion.div>
                
                {/* Podium indicator for top 3 */}
                {team.position <= 3 && (
                  <motion.div
                    className="absolute bottom-2 right-2 bg-f1red rounded-full p-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + team.position * 0.1, type: 'spring' }}
                  >
                    <Trophy className="w-5 h-5 text-f1light" />
                  </motion.div>
                )}
                
                {/* Position Badge */}
                <div className="absolute top-2 left-2 bg-f1dark/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-f1light font-bold">P{team.position}</span>
                </div>
              </div>

              {/* Team Logo and Name */}
              <div className="flex items-center gap-3 mb-4">
                {team.teamLogo && (
                  <img 
                    src={team.teamLogo}
                    alt={`${team.name} logo`}
                    className="w-12 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-f1light">{team.name}</h3>
                  <p className="text-f1light/60 text-xs">{team.nationality}</p>
                </div>
              </div>

              {/* Points */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-f1red" />
                    <span className="text-f1light/80 text-sm">Points</span>
                  </div>
                  <span className="text-f1red font-bold text-lg">{team.points}</span>
                </div>
                <div className="w-full bg-f1dark rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: `#${team.teamColor}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(team.points / maxPoints) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  />
                </div>
              </div>

              {/* Wins */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-f1red" />
                    <span className="text-f1light/80 text-sm">Wins</span>
                  </div>
                  <span className="text-f1light font-bold">{team.wins}</span>
                </div>
                <div className="w-full bg-f1dark rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-f1red rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(team.wins / maxWins) * 100}%` }}
                    transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                  />
                </div>
              </div>

              {/* Hover indicator */}
              <AnimatePresence>
                {hoveredCard === team.id && (
                  <motion.div
                    className="absolute bottom-4 right-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <TrendingUp className="w-5 h-5 text-f1red" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
