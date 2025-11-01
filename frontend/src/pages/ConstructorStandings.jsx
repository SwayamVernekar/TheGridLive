import { useState, useEffect } from 'react';
import { Trophy, Award, Loader2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchConstructorStandings } from '../api/f1Api';

export function ConstructorStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadStandings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchConstructorStandings(season);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        if (!response.standings || response.standings.length === 0) {
          throw new Error('No constructor standings data available for this season');
        }
        
        setStandings(response.standings);
      } catch (err) {
        console.error('Error loading constructor standings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStandings();
  }, [season]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading constructor standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Error Loading Constructor Standings</h3>
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

  const leader = standings[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Constructor Standings</h1>
          <p className="text-foreground/60">{season} Formula 1 World Championship</p>
        </div>
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="bg-f1dark text-f1light px-4 py-2 rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
        </select>
      </div>

      {/* Standings Table */}
      <div className="bg-f1gray rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-f1dark">
              <tr>
                <th className="px-6 py-4 text-left text-f1light">Position</th>
                <th className="px-6 py-4 text-left text-f1light">Team</th>
                <th className="px-6 py-4 text-right text-f1light">Points</th>
                <th className="px-6 py-4 text-right text-f1light">Gap to Leader</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => {
                const gapToLeader = index === 0 ? 0 : (leader?.points || 0) - (team.points || 0);

                return (
                  <tr
                    key={team.team || index}
                    className="border-b border-f1light/10 hover:bg-f1red/10 transition-colors"
                  >
                    {/* Position */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Trophy className="w-5 h-5 text-f1red" />}
                        <span className="text-f1light font-bold text-lg">{team.position || index + 1}</span>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {team.teamLogo ? (
                          <img 
                            src={team.teamLogo} 
                            alt={team.name}
                            className="w-12 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-12 h-8 rounded flex items-center justify-center"
                          style={{ 
                            backgroundColor: `#${team.teamColor || 'ffffff'}`,
                            display: team.teamLogo ? 'none' : 'flex'
                          }}
                        >
                          <Award
                            className="w-5 h-5"
                            style={{
                              color: team.teamColor?.toLowerCase() === 'ffffff' ? '#000000' : '#FFFFFF',
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-f1light font-bold">{team.name}</div>
                          <div className="text-f1light/60 text-xs">{team.nationality}</div>
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-f1red font-bold text-lg">{team.points || 0}</span>
                    </td>

                    {/* Gap to Leader */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-f1light/60">
                        {gapToLeader === 0 ? '-' : `-${gapToLeader}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points Comparison Chart */}
      <div className="bg-f1gray rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-f1red" />
          <h2 className="text-xl font-bold text-f1light">Points Comparison</h2>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={standings.slice(0, 10).map(team => ({
                name: team.name?.split(' ').pop() || team.team || 'Team',
                points: team.points || 0,
                color: `#${team.teamColor || 'DC0000'}`
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#F1F5F9"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#F1F5F9" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F1F5F9'
                }}
                formatter={(value, name) => [value, 'Points']}
              />
              <Bar
                dataKey="points"
                fill="#DC0000"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Championship Leader Card */}
      {leader && (
        <div
          className="mt-6 bg-gradient-to-r from-f1red to-f1red/70 rounded-lg p-6 shadow-lg"
          style={{
            background: `linear-gradient(135deg, #${leader.teamColor || 'DC0000'}, #DC0000)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-f1light/80 text-sm uppercase mb-1">{season} Constructor Champion</div>
              <div className="text-3xl font-bold text-f1light">{leader.team}</div>
              {leader.drivers && (
                <div className="text-f1light/90 mt-1">
                  Drivers: {leader.drivers.map(d => d.fullName || d.name).join(' & ')}
                </div>
              )}
            </div>
            <div className="text-right">
              <Trophy className="w-16 h-16 text-f1light mb-2 mx-auto" />
              <div className="text-2xl font-bold text-f1light">{leader.points} pts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
