import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Loader2, Award, Target, Zap } from 'lucide-react';
import { fetchDriverStandings } from '../api/f1Api';

export function DriverStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear());

  console.log('🏁 [DriverStandings] Component render');
  console.log('  Current state - loading:', loading, 'error:', error, 'standings count:', standings.length);
  console.log('  Season:', season);

  useEffect(() => {
    console.log('\n📊 [DriverStandings useEffect] Triggered');
    console.log('  Season:', season);
    
    const loadStandings = async () => {
      console.log('  [loadStandings] Starting...');
      setLoading(true);
      console.log('  [loadStandings] Set loading = true');
      setError(null);
      console.log('  [loadStandings] Set error = null');
      
      try {
        console.log('  [loadStandings] Calling fetchDriverStandings...');
        const response = await fetchDriverStandings(season);
        console.log('  [loadStandings] ✓ fetchDriverStandings returned');
        console.log('  [loadStandings] Response:', response);
        console.log('  [loadStandings] Response keys:', Object.keys(response));
        
        if (response.error) {
          console.error('  [loadStandings] ❌ Response contains error:', response.error);
          throw new Error(response.error);
        }
        
        console.log('  [loadStandings] Checking standings data...');
        console.log('  [loadStandings] standings exists:', !!response.standings);
        console.log('  [loadStandings] standings is array:', Array.isArray(response.standings));
        console.log('  [loadStandings] standings length:', response.standings?.length);
        
        if (!response.standings || response.standings.length === 0) {
          console.error('  [loadStandings] ❌ No standings data');
          throw new Error('No standings data available for this season');
        }
        
        console.log('  [loadStandings] Sample standing:', response.standings[0]);
        console.log('  [loadStandings] Calling setStandings with', response.standings.length, 'items');
        setStandings(response.standings);
        console.log('  [loadStandings] ✓ setStandings called');
      } catch (err) {
        console.error('  [loadStandings] ❌ ERROR CAUGHT');
        console.error('  [loadStandings] Error:', err);
        console.error('  [loadStandings] Error message:', err.message);
        console.error('Error loading standings:', err);
        setError(err.message);
        console.log('  [loadStandings] Set error =', err.message);
      } finally {
        console.log('  [loadStandings] Finally block - setting loading = false');
        setLoading(false);
        console.log('  [loadStandings] ✓ Complete');
      }
    };

    loadStandings();
  }, [season]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading driver standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Error Loading Standings</h3>
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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Driver Standings</h1>
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

      <div className="bg-f1gray rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-f1dark">
              <tr>
                <th className="px-6 py-4 text-left text-f1light">Position</th>
                <th className="px-6 py-4 text-left text-f1light">Driver</th>
                <th className="px-6 py-4 text-left text-f1light">Team</th>
                <th className="px-6 py-4 text-right text-f1light">Points</th>
                <th className="px-6 py-4 text-center text-f1light">Status</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((driver, index) => {
                // Determine trend based on position (simplified)
                const trend = index === 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : index < 3 ? (
                  <Minus className="w-5 h-5 text-f1light/40" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                );

                // Mock nationality flags (using emoji flags for simplicity)
                const getNationalityFlag = (nationality) => {
                  const flagMap = {
                    'Dutch': '🇳🇱',
                    'British': '🇬🇧',
                    'Spanish': '🇪🇸',
                    'French': '🇫🇷',
                    'German': '🇩🇪',
                    'Australian': '🇦🇺',
                    'Mexican': '🇲🇽',
                    'Finnish': '🇫🇮',
                    'Canadian': '🇨🇦',
                    'Thai': '🇹🇭',
                    'Japanese': '🇯🇵',
                    'Chinese': '🇨🇳',
                    'Danish': '🇩🇰',
                    'American': '🇺🇸'
                  };
                  return flagMap[nationality] || '🏁';
                };

                // Mock detailed stats (wins, podiums, fastest laps, pole positions)
                const mockStats = {
                  wins: Math.floor(Math.random() * 10),
                  podiums: Math.floor(Math.random() * 15) + 5,
                  fastestLaps: Math.floor(Math.random() * 8),
                  polePositions: Math.floor(Math.random() * 12)
                };

                return (
                  <tr
                    key={driver.driverNumber || index}
                    className="border-b border-f1light/10 hover:bg-f1red/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Trophy className="w-5 h-5 text-f1red" />}
                        <span className="text-f1light font-bold text-lg">{driver.position || index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={driver.driverImage || ''} alt={driver.fullName || 'Driver'} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-f1light font-bold flex items-center gap-2">
                            {driver.fullName || 'Unknown Driver'}
                            <span className="text-lg">{getNationalityFlag(driver.nationality)}</span>
                          </div>
                          <div className="text-f1light/60 text-sm uppercase">{driver.driverCode || driver.nationality || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-8 rounded"
                          style={{ backgroundColor: `#${driver.teamColor || 'FFFFFF'}` }}
                        />
                        <span className="text-f1light/80">{driver.constructorName || 'Unknown Team'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-f1red font-bold text-lg">{driver.points || 0}</span>
                        <div className="flex gap-3 text-xs text-f1light/60">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {mockStats.wins}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {mockStats.podiums}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {mockStats.fastestLaps}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">{trend}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Championship Leader Card */}
      {leader && (
        <div className="mt-6 bg-gradient-to-r from-f1red to-f1red/70 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-f1light/80 text-sm uppercase mb-1">{season} Championship Leader</div>
              <div className="text-3xl font-bold text-f1light">
                {leader.fullName || 'Unknown Driver'}
              </div>
              <div className="text-f1light/90 mt-1">{leader.constructorName || 'Unknown Team'}</div>
            </div>
            <div className="text-right">
              <Trophy className="w-16 h-16 text-f1light mb-2 mx-auto" />
              <div className="text-2xl font-bold text-f1light">{leader.points || 0} pts</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
