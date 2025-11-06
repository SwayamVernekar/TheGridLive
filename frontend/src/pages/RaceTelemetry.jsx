import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Loader2, Gauge, Zap, TrendingUp, Calendar, MapPin, Trophy } from 'lucide-react';
import { fetchSchedule, fetchTelemetry, fetchRaceResults } from '../api/f1Api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCircuitImage, getPlaceholderImage } from '../utils/imageUtils';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function RaceTelemetry({ season, round, onNavigate }) {
  const [race, setRace] = useState(null);
  const [raceResults, setRaceResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telemetryData, setTelemetryData] = useState({});
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [activeSession, setActiveSession] = useState('Race');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    loadRaceData();
  }, [season, round]);

  const loadRaceData = async () => {
    setLoading(true);
    try {
      console.log('Loading race data for:', { season, round });
      
      // Load schedule to get race details
      const scheduleResponse = await fetchSchedule(season);
      console.log('Schedule response:', scheduleResponse);
      
      if (scheduleResponse.races) {
        const raceData = scheduleResponse.races.find(r => r.round === parseInt(round));
        console.log('Found race:', raceData);
        setRace(raceData);
        
        // Auto-load telemetry for Race session - use raceData here
        if (raceData) {
          loadRaceTelemetry(raceData, 'Race');
        }
      }

      // Load race results
      const resultsResponse = await fetchRaceResults(season, round);
      console.log('Results response:', resultsResponse);
      setRaceResults(resultsResponse);

    } catch (error) {
      console.error('Error loading race data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load telemetry for a race
  const loadRaceTelemetry = async (raceData, session) => {
    setLoadingTelemetry(true);
    try {
      // Fetch telemetry for all drivers from the race
      const allDrivers = [
        'VER', 'HAM', 'LEC', 'NOR', 'PIA', 'SAI', 'RUS', 'ALO', 
        'STR', 'PER', 'GAS', 'OCO', 'ALB', 'HUL', 'TSU', 'BOT',
        'ZHO', 'MAG', 'RIC', 'SAR', 'BEA', 'ANT', 'DOR', 'HAD', 'LAW'
      ];
      
      const telemetryPromises = allDrivers.map(driver => 
        fetchTelemetry(driver, {
          year: raceData.season,
          event: raceData.raceName,
          session: session
        })
      );
      
      const results = await Promise.all(telemetryPromises);
      const validData = results.filter(r => r.data && r.data.length > 0);
      
      // Extract available drivers
      const driversList = validData.map(d => ({
        code: d.driverId || d.driver,
        name: d.driver
      }));
      
      setAvailableDrivers(driversList);
      setTelemetryData({
        session,
        drivers: validData
      });
      
      // Auto-select first driver if none selected
      if (selectedDriver === 'all' && driversList.length > 0) {
        setSelectedDriver('all');
      }
    } catch (error) {
      console.error('Error loading telemetry:', error);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  // Get filtered telemetry data based on selected driver
  const getFilteredTelemetryData = () => {
    if (!telemetryData.drivers) return [];
    
    if (selectedDriver === 'all') {
      return telemetryData.drivers.slice(0, 5); // Show top 5 drivers
    }
    
    return telemetryData.drivers.filter(d => 
      d.driverId === selectedDriver || d.driver === selectedDriver
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading race data...</p>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Race Not Found</h3>
        <p className="text-f1light/80">Unable to load race data for Round {round}, {season}</p>
        <button
          onClick={() => onNavigate?.('/schedule')}
          className="mt-4 px-4 py-2 bg-f1red text-white rounded hover:bg-f1red/80 transition-colors"
        >
          Back to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate?.('/schedule')}
        className="flex items-center gap-2 text-f1light/60 hover:text-f1light transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Schedule
      </button>

      {/* Race Header */}
      <motion.div
        className="glass-strong rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-f1red flex items-center justify-center font-bold text-f1light">
                {race.round}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-f1light">{race.raceName}</h1>
                <p className="text-f1light/60">{race.circuitName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-f1light/80">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{race.locality}, {race.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(race.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
            Completed
          </span>
        </div>

        {/* Circuit Image */}
        <div className="rounded-lg overflow-hidden">
          <ImageWithFallback
            src={getCircuitImage(race.circuitId)}
            alt={race.circuitName}
            className="w-full h-48 object-contain bg-f1dark/50"
            type="circuit"
          />
        </div>
      </motion.div>

      {/* Session Tabs */}
      <div className="glass-strong rounded-lg p-6">
        <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-f1red" />
          Session Telemetry
        </h2>
        
        <div className="flex gap-2 overflow-x-auto mb-6">
          {['FP1', 'FP2', 'FP3', 'Qualifying', 'Race'].map((session) => (
            <button
              key={session}
              onClick={() => {
                setActiveSession(session);
                loadRaceTelemetry(race, session);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeSession === session
                  ? 'bg-f1red text-white'
                  : 'bg-f1light/10 text-f1light/60 hover:bg-f1light/20'
              }`}
            >
              {session}
            </button>
          ))}
        </div>

        {/* Driver Selection Dropdown */}
        {availableDrivers.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-f1light/80 mb-2">
              Select Driver
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full md:w-64 bg-f1dark text-f1light px-4 py-2 rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            >
              <option value="all">All Drivers (Top 5)</option>
              {availableDrivers.map((driver) => (
                <option key={driver.code} value={driver.code}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Telemetry Data */}
        {loadingTelemetry ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
              <p className="text-f1light/60">Loading telemetry data...</p>
            </div>
          </div>
        ) : telemetryData.drivers && telemetryData.drivers.length > 0 ? (
          <div className="space-y-6">
            {/* Speed Chart */}
            <div className="glass-light rounded-lg p-6">
              <h3 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-f1red" />
                Speed Analysis - {activeSession}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="lap" 
                    stroke="#ffffff60"
                    label={{ value: 'Lap', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#ffffff60"
                    label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a2e', 
                      border: '1px solid rgba(220, 0, 0, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {getFilteredTelemetryData().map((driver, idx) => (
                    <Line
                      key={driver.driverId}
                      data={driver.data}
                      type="monotone"
                      dataKey="speed"
                      name={driver.driver}
                      stroke={['#DC0000', '#00D2BE', '#E10600', '#FF8700', '#0600EF'][idx % 5]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Throttle and Brake Chart */}
            <div className="glass-light rounded-lg p-6">
              <h3 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-f1red" />
                Throttle & Brake Application
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="lap" 
                    stroke="#ffffff60"
                    label={{ value: 'Lap', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#ffffff60"
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a2e', 
                      border: '1px solid rgba(220, 0, 0, 0.5)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {getFilteredTelemetryData().slice(0, 3).map((driver, idx) => (
                    <>
                      <Line
                        key={`${driver.driverId}-throttle`}
                        data={driver.data}
                        type="monotone"
                        dataKey="throttle"
                        name={`${driver.driver} Throttle`}
                        stroke={['#00D2BE', '#E10600', '#FF8700'][idx]}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        key={`${driver.driverId}-brake`}
                        data={driver.data}
                        type="monotone"
                        dataKey="brake"
                        name={`${driver.driver} Brake`}
                        stroke={['#0600EF', '#DC0000', '#00D2BE'][idx]}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Driver Stats Grid */}
            <div>
              <h3 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-f1red" />
                Driver Statistics
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {getFilteredTelemetryData().map((driver, idx) => (
                  <motion.div
                    key={driver.driverId}
                    className="glass-light rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <h4 className="font-bold text-f1light mb-2">{driver.driver}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-f1light/60">Laps:</span>
                        <span className="text-f1light">{driver.data.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-f1light/60">Avg Speed:</span>
                        <span className="text-f1light">
                          {(driver.data.reduce((sum, d) => sum + d.speed, 0) / driver.data.length).toFixed(1)} km/h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-f1light/60">Max Speed:</span>
                        <span className="text-f1light">
                          {Math.max(...driver.data.map(d => d.speed)).toFixed(1)} km/h
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-f1light/20 mx-auto mb-4" />
            <p className="text-f1light/60">No telemetry data available for this session</p>
            <p className="text-f1light/40 text-sm mt-2">Try selecting a different session</p>
          </div>
        )}
      </div>

      {/* Race Results Section */}
      {raceResults && raceResults.results && raceResults.results.length > 0 && (
        <motion.div
          className="glass-strong rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-f1red" />
            Race Results
          </h2>
          <div className="space-y-2">
            {raceResults.results.slice(0, 10).map((result, idx) => (
              <div
                key={idx}
                className="glass-light rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    result.position === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                    result.position === 2 ? 'bg-gray-400/20 text-gray-400' :
                    result.position === 3 ? 'bg-orange-600/20 text-orange-600' :
                    'bg-f1light/10 text-f1light/60'
                  }`}>
                    {result.position}
                  </div>
                  <div>
                    <div className="font-bold text-f1light">{result.driverName || result.driver}</div>
                    <div className="text-sm text-f1light/60">{result.constructorName || result.constructor}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-f1light">{result.time || result.status}</div>
                  <div className="text-sm text-f1light/60">{result.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
