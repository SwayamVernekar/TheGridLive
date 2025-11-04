import { useState, useEffect } from 'react'; // Added useEffect for the G-Force animation
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Radio, Gauge, Trophy, Clock, Activity, Calendar, MapPin } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

// StatCard Component
const StatCard = ({ icon: Icon, label, value, subtitle, highlight }) => (
  <div className={`glass-strong rounded-lg p-6 shadow-lg ${highlight ? 'border-l-4 border-f1red' : ''}`}>
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-6 h-6 text-f1red" />
      <p className="text-f1light/60 uppercase text-sm tracking-wider">{label}</p>
    </div>
    <p className="text-3xl font-bold text-f1light">{value}</p>
    <p className="text-f1light/80 text-sm mt-1">{subtitle}</p>
  </div>
);


// The TypeScript interface is removed.

export function Live() {
  const [scheduleData, setScheduleData] = useState(null);
  const [telemetryData, setTelemetryData] = useState([]);
  const [winPredictions, setWinPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schedule data on component mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/data/schedule');
        if (!response.ok) {
          throw new Error('Failed to fetch schedule data');
        }
        const data = await response.json();
        setScheduleData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Fetch telemetry and predictions when live race is detected
  useEffect(() => {
    const liveRace = getLiveRace();
    if (liveRace) {
      fetchTelemetryData();
      fetchWinPredictions();
    }
  }, [scheduleData]);

  const fetchTelemetryData = async () => {
    try {
      // For demo purposes, fetch telemetry for top drivers
      const topDrivers = ['max_verstappen', 'lewis_hamilton'];
      const telemetryPromises = topDrivers.map(async (driver) => {
        try {
          const response = await fetch(`/api/data/telemetry/${driver}?year=2025&event=${getLiveRace()?.circuitId}&session=R`);
          if (response.ok) {
            const data = await response.json();
            return data;
          }
        } catch (err) {
          console.warn(`Failed to fetch telemetry for ${driver}:`, err);
        }
        return null;
      });

      const telemetryResults = await Promise.all(telemetryPromises);
      const validTelemetry = telemetryResults.filter(data => data);

      if (validTelemetry.length > 0) {
        // Process telemetry data for chart
        const processedData = processTelemetryForChart(validTelemetry);
        setTelemetryData(processedData);
      } else {
        // Fallback to mock data if telemetry service unavailable
        setTelemetryData(generateLiveTelemetry());
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
      // Fallback to mock data
      setTelemetryData(generateLiveTelemetry());
    }
  };

  const fetchWinPredictions = async () => {
    try {
      const response = await fetch('/api/data/standings/drivers');
      if (response.ok) {
        const data = await response.json();
        const predictions = calculateWinPredictions(data.standings || []);
        setWinPredictions(predictions);
      } else {
        // Fallback to mock predictions
        setWinPredictions([
          { driver: "Max Verstappen", team: "Red Bull", probability: 75, color: "#0600EF" },
          { driver: "Lewis Hamilton", team: "Mercedes", probability: 15, color: "#00D2BE" },
          { driver: "Charles Leclerc", team: "Ferrari", probability: 5, color: "#DC0000" },
        ]);
      }
    } catch (err) {
      console.error('Error fetching win predictions:', err);
      // Fallback to mock predictions
      setWinPredictions([
        { driver: "Max Verstappen", team: "Red Bull", probability: 75, color: "#0600EF" },
        { driver: "Lewis Hamilton", team: "Mercedes", probability: 15, color: "#00D2BE" },
        { driver: "Charles Leclerc", team: "Ferrari", probability: 5, color: "#DC0000" },
      ]);
    }
  };

  const processTelemetryForChart = (telemetryData) => {
    // Process telemetry data into chart format
    // This is a simplified version - real implementation would aggregate data
    const maxLaps = Math.max(...telemetryData.map(d => d.length || 0));
    const chartData = [];

    for (let lap = 1; lap <= maxLaps; lap++) {
      const lapData = { lap };
      telemetryData.forEach((driverData, index) => {
        const driverName = index === 0 ? 'Max Verstappen' : 'Lewis Hamilton';
        const speed = driverData[lap - 1]?.Speed || (300 + Math.sin(lap * 0.5) * 20);
        lapData[driverName] = speed;
      });
      chartData.push(lapData);
    }

    return chartData.length > 0 ? chartData : generateLiveTelemetry();
  };

  const calculateWinPredictions = (standings) => {
    if (!standings || standings.length === 0) {
      return [
        { driver: "Max Verstappen", team: "Red Bull", probability: 75, color: "#0600EF" },
        { driver: "Lewis Hamilton", team: "Mercedes", probability: 15, color: "#00D2BE" },
        { driver: "Charles Leclerc", team: "Ferrari", probability: 5, color: "#DC0000" },
      ];
    }

    // Calculate win probability based on current standings (simplified)
    const totalPoints = standings.reduce((sum, driver) => sum + driver.points, 0);
    return standings.slice(0, 3).map((driver, index) => ({
      driver: driver.fullName,
      team: driver.constructorName,
      probability: Math.max(5, Math.round((driver.points / totalPoints) * 100)),
      color: driver.teamColor || '#cccccc'
    }));
  };

  // Mock data fallback functions
  const generateLiveTelemetry = () => {
    return Array.from({ length: 30 }, (_, i) => ({
      lap: i + 1,
      'Max Verstappen': 300 + Math.sin(i * 0.5) * 20,
      'Lewis Hamilton': 305 + Math.cos(i * 0.3) * 15,
    }));
  };

  // Determine if there's a live race today
  const getLiveRace = () => {
    if (!scheduleData?.races) return null;

    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    return scheduleData.races.find(race => race.date === today);
  };

  const liveRace = getLiveRace();

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show error message
  if (error) {
    return (
      <div className="space-y-6">
        <div className="glass-strong rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-f1light mb-4">Live Race Feed</h1>
          <p className="text-f1light/80">Unable to load schedule data: {error}</p>
        </div>
      </div>
    );
  }

  // If no live race, show next race info
  if (!liveRace) {
    const nextRace = scheduleData?.nextRace;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="flex items-center gap-2 bg-gray-600 px-4 py-2 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Radio className="w-5 h-5 text-f1light" />
            <h1 className="text-xl font-bold text-f1light">LIVE RACE FEED</h1>
          </motion.div>
        </div>

        <motion.div
          className="glass-strong rounded-lg p-8 text-center shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-center mb-4">
            <Calendar className="w-16 h-16 text-f1light/50" />
          </div>
          <h2 className="text-2xl font-bold text-f1light mb-4">No Live Race Today</h2>
          {nextRace ? (
            <div className="space-y-4">
              <p className="text-f1light/80 text-lg">Next race:</p>
              <div className="glass-light rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-f1light mb-2">{nextRace.raceName}</h3>
                <div className="flex items-center justify-center gap-2 text-f1light/80 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{nextRace.locality}, {nextRace.country}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-f1light/60">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(nextRace.date).toLocaleDateString()} at {nextRace.time}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-f1light/80">No upcoming races scheduled</p>
          )}
        </motion.div>
      </div>
    );
  }

  // Live race is happening - show live feed

  // TypeScript type annotation is removed, initializing with a plain JavaScript object.
  const [gForce, setGForce] = useState({ lateral: 3.5, longitudinal: -1.2 });

  // Update G-Force state every second to simulate live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setGForce({
        // Lateral G: typically 1.5 to 4.5 G
        lateral: parseFloat((Math.random() * 3 + 1.5).toFixed(1)),
        // Longitudinal G: braking (-1 to -5 G) or acceleration (0.5 to 2 G)
        longitudinal: parseFloat((Math.random() * 6 - 4).toFixed(1)),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Constants for motion properties
  const motionDuration = 1.5;
  const motionRepeat = Infinity;
  
  // Custom Recharts Tooltip content style
  const tooltipContentStyle = {
    backgroundColor: '#0B0B0B', 
    border: '1px solid #DC0000',
    borderRadius: '4px',
    color: '#F5F5F5',
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          className="flex items-center gap-2 bg-f1red px-4 py-2 rounded-lg"
          animate={{ 
            boxShadow: ['0 0 0px rgba(220, 0, 0, 0)', '0 0 30px rgba(220, 0, 0, 0.8)', '0 0 0px rgba(220, 0, 0, 0)'],
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          <Radio className="w-5 h-5 text-f1light" />
          <h1 className="text-xl font-bold text-f1light">LIVE RACE FEED</h1>
        </motion.div>
        <div className="text-f1light/80 text-sm flex items-center gap-1">
            <Activity className="w-4 h-4 text-f1light/50" />
            Active Lap: 15 - {liveRace.raceName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Chart */}
        <motion.div 
          className="glass-strong rounded-lg p-6 lg:col-span-2 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-f1red" /> Live Speed Comparison
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={telemetryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="lap" stroke="#F5F5F5" />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#F5F5F5" />
              <Tooltip contentStyle={tooltipContentStyle} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="Max Verstappen" 
                stroke="#0600EF" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#0600EF' }}
                activeDot={{ r: 8, fill: '#0600EF' }}
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="Lewis Hamilton" 
                stroke="#00D2BE" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#00D2BE' }}
                activeDot={{ r: 8, fill: '#00D2BE' }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* G-Force Indicator */}
          <motion.div 
            className="glass-strong rounded-lg p-6 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-f1red" /> G-Force Meter
            </h2>

            <div className="w-full aspect-square max-w-sm mx-auto mb-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Grid lines */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#DC0000" strokeWidth="1" opacity="0.2" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="#DC0000" strokeWidth="1" opacity="0.2" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="#DC0000" strokeWidth="1" opacity="0.2" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#DC0000" strokeWidth="1" opacity="0.2" />
                
                {/* Axis lines */}
                <line x1="100" y1="20" x2="100" y2="180" stroke="#F5F5F5" strokeWidth="1" opacity="0.3" />
                <line x1="20" y1="100" x2="180" y2="100" stroke="#F5F5F5" strokeWidth="1" opacity="0.3" />
                
                {/* Labels */}
                <text x="100" y="15" textAnchor="middle" fill="#F5F5F5" fontSize="10">+5G</text>
                <text x="100" y="195" textAnchor="middle" fill="#F5F5F5" fontSize="10">-5G</text>
                <text x="15" y="105" textAnchor="middle" fill="#F5F5F5" fontSize="10">-5G</text>
                <text x="185" y="105" textAnchor="middle" fill="#F5F5F5" fontSize="10">+5G</text>
                
                {/* G-Force indicator (Max G-force is roughly 5G, so scale factor is 16 = 80/5) */}
                <motion.circle
                  cx={100 + (gForce.lateral * 16)}
                  cy={100 - (gForce.longitudinal * 16)} // Y-axis is inverted in SVG, so subtract for positive long. G (acceleration)
                  r="10"
                  fill="#DC0000"
                  animate={{
                    boxShadow: ['0 0 0px rgba(220, 0, 0, 0)', '0 0 20px rgba(220, 0, 0, 1)', '0 0 0px rgba(220, 0, 0, 0)'],
                  }}
                  transition={{ duration: motionDuration, repeat: motionRepeat, repeatType: "reverse" }}
                />
                {/* Pulse ring for emphasis */}
                <motion.circle
                  cx={100 + (gForce.lateral * 16)}
                  cy={100 - (gForce.longitudinal * 16)}
                  r="15"
                  fill="none"
                  stroke="#DC0000"
                  strokeWidth="2"
                  opacity="0.5"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-light p-3 rounded-lg text-center">
                <div className="text-f1light/60 text-xs">Lateral (Turning)</div>
                <div className="text-f1light font-bold text-xl">{gForce.lateral.toFixed(1)} G</div>
              </div>
              <div className="glass-light p-3 rounded-lg text-center">
                <div className="text-f1light/60 text-xs">Long. (Accel/Braking)</div>
                <div className="text-f1light font-bold text-xl">{gForce.longitudinal.toFixed(1)} G</div>
              </div>
            </div>
          </motion.div>

          {/* Win Predictor */}
          <motion.div 
            className="glass-strong rounded-lg p-6 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-f1red" /> Win Prediction
            </h2>
            <div className="space-y-4">
              {winPredictions.map((prediction, index) => (
                <motion.div 
                  key={prediction.driver} 
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex justify-between items-center text-f1light">
                    <p className="font-bold flex items-center gap-2">
                        <span className="text-f1red font-extrabold w-4">{index + 1}.</span>
                        {prediction.driver}
                        <span className="text-xs text-f1light/50 font-normal">({prediction.team})</span>
                    </p>
                    <p className="text-xl font-extrabold" style={{ color: prediction.color }}>{prediction.probability}%</p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: `${prediction.color}40` }}>
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: prediction.color }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${prediction.probability}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Gauge}
          label="Fastest Lap"
          value="Max Verstappen"
          subtitle="1:36.169"
          highlight
        />
        
        <StatCard
          icon={Trophy}
          label="Current Leader"
          value="Max Verstappen"
          subtitle="Gap: +0.000s"
        />
        
        <StatCard
          icon={Clock}
          label="Laps Completed"
          value="15 / 56"
          subtitle="27% Complete"
        />
      </div>
    </div>
  );
}