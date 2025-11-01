import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, Award, Loader2, Search, Filter } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { fetchDrivers } from '../api/f1Api';

export function Drivers({ onNavigate }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [sortBy, setSortBy] = useState('position');

  useEffect(() => {
    const loadDrivers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchDrivers();

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.drivers || response.drivers.length === 0) {
          throw new Error('No drivers data available for this season');
        }

        // Use the data directly from Ergast - it's already properly formatted
        setDrivers(response.drivers);
        setFilteredDrivers(response.drivers);
      } catch (err) {
        console.error('Error loading drivers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, []);

  // Filter and sort drivers
  useEffect(() => {
    let filtered = [...drivers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Team filter
    if (selectedTeam) {
      filtered = filtered.filter(driver => driver.team === selectedTeam);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'points':
          return (b.points || 0) - (a.points || 0);
        case 'wins':
          return (b.wins || 0) - (a.wins || 0);
        case 'position':
        default:
          return (a.position || 999) - (b.position || 999);
      }
    });

    setFilteredDrivers(filtered);
  }, [drivers, searchTerm, selectedTeam, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Error Loading Drivers</h3>
        <p className="text-f1light/80">{error}</p>
        <p className="text-f1light/60 text-sm mt-2">
          Make sure the Python data service is running on port 5003 and the Node.js backend is running on port 5002.
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

  const maxPoints = Math.max(...drivers.map(d => d.points || 0), 1);
  const maxWins = Math.max(...drivers.map(d => d.wins || 0), 1);

  // Get unique teams for filter dropdown
  const uniqueTeams = [...new Set(drivers.map(d => d.team).filter(Boolean))];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">F1 Drivers</h1>
        <p className="text-foreground/60">Complete driver lineup for the {new Date().getFullYear()} season</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-f1light/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drivers, teams, or nationalities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-f1dark text-f1light rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-4 py-2 bg-f1dark text-f1light rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            >
              <option value="">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-f1dark text-f1light rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            >
              <option value="position">Sort by Position</option>
              <option value="name">Sort by Name</option>
              <option value="points">Sort by Points</option>
              <option value="wins">Sort by Wins</option>
            </select>
          </div>
        </div>

        <div className="text-f1light/60 text-sm mt-2">
          Showing {filteredDrivers.length} of {drivers.length} drivers
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            className="glass-strong rounded-xl overflow-hidden shadow-lg cursor-pointer relative"
            onHoverStart={() => setHoveredCard(driver.id)}
            onHoverEnd={() => setHoveredCard(null)}
            onClick={() => onNavigate?.(`/driver/${driver.id}`)}
            whileHover={{ scale: 1.05 }}
          >
            {/* Team color accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, #${driver.teamColor || 'ffffff'}, transparent)`,
              }}
            />

            {/* Glowing border on hover */}
            {hoveredCard === driver.id && (
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  boxShadow: `0 0 20px #${driver.teamColor || 'ffffff'}`,
                  pointerEvents: 'none',
                }}
              />
            )}

            <div className="p-6">
              {/* Driver Photo */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full overflow-hidden bg-f1dark ring-4 ring-offset-2 ring-offset-transparent">
                  <ImageWithFallback
                    src={driver.driverImage}
                    alt={driver.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Podium indicator for top 3 */}
                {driver.position <= 3 && (
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-f1red rounded-full p-2 text-white text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + driver.position * 0.1 }}
                  >
                    🏆
                  </motion.div>
                )}
              </div>

              {/* Driver Name & Team */}
              <h3 className="text-xl font-bold text-f1light text-center mb-1">{driver.fullName}</h3>
              <div className="text-center text-f1red font-bold text-sm mb-2">#{driver.number}</div>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: `#${driver.teamColor}` }}
                />
                <p className="text-f1light/80 text-sm">{driver.team}</p>
              </div>

              {/* Points */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-f1red" />
                    <span className="text-f1light/80 text-sm">Points</span>
                  </div>
                  <span className="font-bold text-f1red">{driver.points}</span>
                </div>
                <div className="h-2 bg-f1dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, #${driver.teamColor || 'DC0000'}, #DC0000)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(driver.points / maxPoints) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Wins */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-f1red" />
                    <span className="text-f1light/80 text-sm">Wins</span>
                  </div>
                  <span className="font-bold text-f1light">{driver.wins}</span>
                </div>
                <div className="h-2 bg-f1dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-f1red rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(driver.wins / maxWins) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-f1light/10">
                <div className="text-center">
                  <div className="text-f1light/60 text-xs mb-1">Podiums</div>
                  <div className="text-f1light font-bold">{driver.podiums}</div>
                </div>
                <div className="text-center">
                  <div className="text-f1light/60 text-xs mb-1">Number</div>
                  <div className="text-f1light font-bold">#{driver.number}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
