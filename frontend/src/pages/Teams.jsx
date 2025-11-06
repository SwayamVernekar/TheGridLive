import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, TrendingUp, Users, Loader2, BarChart3, X, Zap, Target } from 'lucide-react';
import { fetchTeams } from '../api/f1Api';

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

// Team logos mapping (using official F1 team logos)
const teamLogos = {
  'Red Bull Racing': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Red_Bull_Racing_logo.svg/200px-Red_Bull_Racing_logo.svg.png',
  'Ferrari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Scuderia_Ferrari_Logo.svg/200px-Scuderia_Ferrari_Logo.svg.png',
  'McLaren': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/McLaren_Racing_logo.svg/200px-McLaren_Racing_logo.svg.png',
  'Aston Martin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Aston_Martin_Aramco_Cognizant_Formula_One_Team_logo.svg/200px-Aston_Martin_Aramco_Cognizant_Formula_One_Team_logo.svg.png',
  'Alpine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Alpine_F1_Team_2021_Logo.svg/200px-Alpine_F1_Team_2021_Logo.svg.png',
  'Williams': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Williams_Racing_2020_logo.svg/200px-Williams_Racing_2020_logo.svg.png',
  'Sauber': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Kick_Sauber_Formula_1_Team_logo.svg/200px-Kick_Sauber_Formula_1_Team_logo.svg.png',
  'Haas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Haas_F1_Team_logo.svg/200px-Haas_F1_Team_logo.svg.png',
  'RB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Visa_Cash_App_RB_Formula_One_Team_logo.svg/200px-Visa_Cash_App_RB_Formula_One_Team_logo.svg.png'
};


export function Teams({ onNavigate }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

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

        setTeams(response.teams);
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
        <p className="text-f1light/60 text-sm mt-2">
          Make sure the backend is running and connected to the data source.
        </p>
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

  const handleTeamSelect = (team) => {
    if (selectedTeams.find(t => t.id === team.id)) {
      setSelectedTeams(selectedTeams.filter(t => t.id !== team.id));
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  // Team Comparison Modal Component
  const TeamComparisonModal = ({ teams: comparisonTeams, onClose }) => {
    if (!comparisonTeams || comparisonTeams.length !== 2) return null;

    const [team1, team2] = comparisonTeams;
    
    // Ensure team colors have # prefix
    const team1Color = team1.teamColor?.startsWith('#') ? team1.teamColor : `#${team1.teamColor || 'DC0000'}`;
    const team2Color = team2.teamColor?.startsWith('#') ? team2.teamColor : `#${team2.teamColor || 'DC0000'}`;
    
    const stats = [
      { key: 'points', label: 'Points', icon: Award },
      { key: 'wins', label: 'Wins', icon: Trophy },
      { key: 'podiums', label: 'Podiums', icon: TrendingUp },
      { key: 'polePositions', label: 'Pole Positions', icon: Target },
    ];

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-f1light">Team Comparison</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-f1light/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-f1light" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[{ team: team1, color: team1Color }, { team: team2, color: team2Color }].map(({ team, color }, index) => (
                  <motion.div
                    key={team.id}
                    className="glass-light rounded-lg p-4"
                    initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {team.teamLogo && (
                        <img src={team.teamLogo} alt={team.name} className="w-12 h-12 object-contain" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-f1light">{team.name}</h3>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-f1light/60">#{index === 0 ? '1' : '2'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {stats.map((stat) => (
                        <div key={stat.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <stat.icon className="w-4 h-4 text-f1red" />
                            <span className="text-f1light/80 text-sm">{stat.label}</span>
                          </div>
                          <span className="font-bold text-f1red">{team[stat.key] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-f1light">Head-to-Head Comparison</h3>
                {stats.map((stat) => {
                  const val1 = team1[stat.key] || 0;
                  const val2 = team2[stat.key] || 0;
                  const max = Math.max(val1, val2, 1);
                  const winner = val1 > val2 ? team1 : val2 > val1 ? team2 : null;

                  return (
                    <div key={stat.key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-f1light/80">{stat.label}</span>
                        <span className="text-f1red font-bold">
                          {winner ? `${winner.name} leads` : 'Tied'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-f1dark rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: team1Color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(val1 / max) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <div className="flex-1 bg-f1dark rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: team2Color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(val2 / max) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-f1light/60">
                        <span>{team1.name}: {val1}</span>
                        <span>{team2.name}: {val2}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="p-4 md:p-8">
      {/* Team Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <TeamComparisonModal
            teams={selectedTeams}
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>

      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-f1light mb-2 bg-gradient-to-r from-f1red to-f1light bg-clip-text text-transparent">
              F1 Constructor Teams
            </h1>
            <p className="text-f1light/70 text-lg">Elite racing teams competing in the 2025 Formula 1 World Championship</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                selectedTeams.length === 2
                  ? 'bg-gradient-to-r from-f1red to-red-600 text-f1light shadow-lg hover:shadow-xl'
                  : 'bg-f1dark/50 text-f1light/60 cursor-not-allowed backdrop-blur-sm'
              }`}
              whileHover={selectedTeams.length === 2 ? { scale: 1.05, y: -2 } : {}}
              whileTap={selectedTeams.length === 2 ? { scale: 0.95 } : {}}
              onClick={() => selectedTeams.length === 2 && setShowComparison(true)}
              disabled={selectedTeams.length !== 2}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Compare Teams ({selectedTeams.length}/2)
            </motion.button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            className="glass-light rounded-lg p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-2xl font-bold text-f1red">{teams.length}</div>
            <div className="text-f1light/60 text-sm">Teams</div>
          </motion.div>
          <motion.div
            className="glass-light rounded-lg p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-f1red">{teams.reduce((sum, t) => sum + (t.points || 0), 0)}</div>
            <div className="text-f1light/60 text-sm">Total Points</div>
          </motion.div>
          <motion.div
            className="glass-light rounded-lg p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-2xl font-bold text-f1red">{teams.reduce((sum, t) => sum + (t.wins || 0), 0)}</div>
            <div className="text-f1light/60 text-sm">Total Wins</div>
          </motion.div>
          <motion.div
            className="glass-light rounded-lg p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-2xl font-bold text-f1red">{teams.reduce((sum, t) => sum + (t.polePositions || 0), 0)}</div>
            <div className="text-f1light/60 text-sm">Pole Positions</div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {teams.map((team, index) => {
          // Ensure team color has # prefix
          const teamColor = team.teamColor?.startsWith('#') ? team.teamColor : `#${team.teamColor || 'DC0000'}`;
          
          return (
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
                background: `linear-gradient(90deg, transparent, ${teamColor}, transparent)`,
                boxShadow: `0 0 10px ${teamColor}`,
              }}
            />

            {/* Glowing border on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredCard === team.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: `0 0 30px ${teamColor}`,
              }}
            />

            <div className="p-6 relative z-10">
              {/* Position and Team Logo */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-f1red">#{index + 1}</div>
                  {team.teamLogo && (
                    <motion.img
                      src={team.teamLogo}
                      alt={`${team.name} logo`}
                      className="w-12 h-12 object-contain"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
                {/* Selection checkbox */}
                <motion.button
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedTeams.find(t => t.id === team.id)
                      ? 'bg-f1red border-f1red'
                      : 'border-f1light/40 hover:border-f1light/80'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTeamSelect(team);
                  }}
                >
                  {selectedTeams.find(t => t.id === team.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 bg-f1light rounded-sm"
                    />
                  )}
                </motion.button>
              </div>

              {/* Team Car Image */}
              <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${teamColor}20, ${teamColor}40)`,
                  }}
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src={team.carImage || `https://source.unsplash.com/600x400/?f1car,racing,speed,${team.name?.replace(/\s+/g, '').toLowerCase()}`}
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
                  style={{ backgroundColor: teamColor }}
                  animate={{
                    boxShadow: hoveredCard === team.id ? `0 0 15px ${teamColor}` : 'none',
                  }}
                  transition={{ duration: 0.3 }}
                />
                <h3 className="text-lg font-bold text-f1light">{team.name}</h3>
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
                    <span className="font-bold text-f1red">{team.points || 0}</span>
                  </div>
                  <div className="h-2 bg-f1dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${teamColor}, #DC0000)`,
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${((team.points || 0) / maxPoints) * 100}%` }}
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
                    <span className="font-bold text-f1red">{team.wins || 0}</span>
                  </div>
                  <div className="h-2 bg-f1dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${teamColor}, #00D2BE)`,
                      }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${((team.wins || 0) / maxWins) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                  </div>
                </div>

                {/* Podiums */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-f1red" />
                      <span className="text-f1light/80 text-sm">Podiums</span>
                    </div>
                    <span className="font-bold text-f1red">{team.podiums || 0}</span>
                  </div>
                </div>

                {/* Pole Positions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-f1red" />
                      <span className="text-f1light/80 text-sm">Pole Positions</span>
                    </div>
                    <span className="font-bold text-f1red">{team.polePositions || 0}</span>
                  </div>
                </div>
              </div>

              {/* View Details Button */}
              <motion.button
                className="w-full flex items-center justify-center gap-2 mt-4 py-2 rounded-lg bg-f1red text-f1light font-bold hover:bg-f1red/80 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate?.(`/team/${team.id}`)}
              >
                <Users className="w-4 h-4" />
                View Team Details
              </motion.button>
            </div>
          </motion.div>
        );})}
      </div>
    </div>
  );
}