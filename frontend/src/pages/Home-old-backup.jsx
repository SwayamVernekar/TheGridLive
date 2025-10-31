import { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Gauge, Zap, Wind, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA/COMPONENTS (Replace with your actual imports) ---
// Mockup for external data
const drivers = [
  { id: 1, name: "Max Verstappen", team: "Red Bull Racing", teamColor: "#0600EF", points: 450, teamId: "RBR" },
  { id: 2, name: "Sergio Perez", team: "Red Bull Racing", teamColor: "#0600EF", points: 300, teamId: "RBR" },
  { id: 3, name: "Lewis Hamilton", team: "Mercedes", teamColor: "#00D2BE", points: 250, teamId: "MER" },
  { id: 4, name: "Charles Leclerc", team: "Ferrari", teamColor: "#DC0000", points: 200, teamId: "FER" },
  { id: 5, name: "Lando Norris", team: "McLaren", teamColor: "#FF8700", points: 180, teamId: "MCL" },
];
const teams = [
  { id: "RBR", name: "Red Bull Racing", teamColor: "#0600EF", points: 750 },
  { id: "MER", name: "Mercedes", teamColor: "#00D2BE", points: 500 },
  { id: "FER", name: "Ferrari", teamColor: "#DC0000", points: 400 },
  { id: "MCL", name: "McLaren", teamColor: "#FF8700", points: 300 },
  { id: "AST", name: "Aston Martin", teamColor: "#006F62", points: 250 },
];
const newsArticles = [
  { id: 1, title: "Verstappen secures 10th consecutive pole position", description: "The Red Bull driver dominated qualifying in Texas...", category: "Qualifying" },
  { id: 2, title: "Mercedes confident after new floor upgrade", description: "Team Principal Toto Wolff believes the new part will close the gap...", category: "Technical" },
  { id: 3, title: "Sainz handed grid penalty for engine change", description: "Ferrari's Carlos Sainz will start Sunday's race from the back...", category: "Race Report" },
];

const ImageWithFallback = ({ src, alt, className }) => <img src={src} alt={alt} className={className} loading="lazy" />;
const RaceCalendar = () => (
  <motion.div 
    className="glass-strong rounded-lg p-6 shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, duration: 0.5 }}
  >
    <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
      <Trophy className="w-5 h-5 text-f1red" /> Race Calendar
    </h2>
    <div className="text-f1light/80 space-y-3">
      <div className="flex justify-between border-b border-f1light/10 pb-2">
        <span>Oct 27</span>
        <span className="font-bold text-f1red">USA GP</span>
      </div>
      <div className="flex justify-between border-b border-f1light/10 pb-2">
        <span>Nov 3</span>
        <span>Mexico GP</span>
      </div>
      <div className="flex justify-between">
        <span>Nov 17</span>
        <span>Brazil GP</span>
      </div>
    </div>
  </motion.div>
);
// -------------------------------------------------------------------


export function Home({ onNavigate, favoriteDriver }) {
  // Initial countdown values (e.g., 7 days away)
  const [countdown, setCountdown] = useState({
    days: 7,
    hours: 12,
    minutes: 34,
    seconds: 56,
  });
  
  const [activeDriverId, setActiveDriverId] = useState(favoriteDriver?.id || 1);

  const activeDriver = drivers.find(d => d.id === activeDriverId) || drivers[0];

  // Update active driver when favorite changes
  useEffect(() => {
    if (favoriteDriver) {
      setActiveDriverId(favoriteDriver.id);
    }
  }, [favoriteDriver]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, minutes, seconds } = prev;

        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          // Reset for demonstration or stop the timer
          clearInterval(timer); 
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array means this runs only on mount/unmount

  // Generate mock telemetry data based on active driver
  const generateTelemetryData = () => {
    // Base values adjusted by driver ID for subtle variation
    const baseSpeed = 300 + (activeDriver.id * 5);
    const baseRpm = 10000 + (activeDriver.id * 500);
    const dataLength = 20;

    return Array.from({ length: dataLength }, (_, i) => ({
      lap: i + 1,
      // Speed variation
      speed: Math.floor(baseSpeed + Math.sin(i * 0.5) * 20 - Math.cos(i * 0.2) * 10),
      // RPM variation
      rpm: Math.floor(baseRpm + Math.sin(i * 0.3) * 2000 - Math.cos(i * 0.1) * 1000),
      // Throttle (not used in graphs but good to include)
      throttle: Math.floor(Math.random() * 80 + 20),
    }));
  };

  const telemetryData = generateTelemetryData();

  // Quick stats for active driver
  const quickStats = {
    speed: Math.floor(300 + Math.random() * 50),
    rpm: Math.floor(10000 + Math.random() * 3000),
    ers: Math.floor(Math.random() * 40),
    drs: Math.random() > 0.6 ? 'ACTIVE' : 'STANDBY',
    gear: Math.floor(Math.random() * 7) + 1,
    brake: Math.floor(Math.random() * 30),
  };

  return (
    <div className="space-y-6">
      {/* Grid Live Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Driver List */}
        <div className="lg:col-span-3 space-y-4">
          <motion.div
            className="glass-strong rounded-lg p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-f1light mb-3">Driver Select</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {drivers.map((driver, index) => (
                <motion.div
                  key={driver.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all relative overflow-hidden ${
                    activeDriverId === driver.id ? 'glass-light' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setActiveDriverId(driver.id)}
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Active driver highlight ring */}
                  {activeDriverId === driver.id && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        boxShadow: `inset 0 0 20px ${driver.teamColor}40`,
                        border: `1px solid ${driver.teamColor}80`,
                      }}
                      initial={{ opacity: 0.5 }}
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: driver.teamColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-f1light font-bold truncate">{driver.name}</div>
                      <div className="text-f1light/60 text-xs truncate">{driver.team}</div>
                    </div>
                    <div className="text-f1red font-bold text-sm">P{index + 1}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Active Driver Car Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDriverId}
              className="glass-strong rounded-lg p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-extrabold text-f1light">{activeDriver.name}</h2>
                    <p className="text-f1light/70 text-lg" style={{ color: activeDriver.teamColor }}>{activeDriver.team}</p>
                  </div>
                  <motion.button
                    className="bg-f1red hover:bg-f1red/80 text-f1light font-bold py-2 px-4 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate?.(`/driver/${activeDriver.id}`)}
                  >
                    View Full Stats
                  </motion.button>
                </div>

                {/* Car Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${activeDriver.teamColor}20, ${activeDriver.teamColor}40)`,
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0.8, x: -50 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <ImageWithFallback
                      src={`https://source.unsplash.com/1000x500/?f1,car,team,speed,track,${activeDriver.teamId}`}
                      alt={`${activeDriver.team} Car`}
                      className="max-h-full object-contain drop-shadow-2xl"
                    />
                  </motion.div>

                  {/* Speed lines animation */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-0 h-1 bg-gradient-to-r from-transparent via-f1light/30 to-transparent"
                      style={{ top: `${20 + i * 15}%`, width: '100%' }}
                      initial={{ x: -100 }}
                      animate={{ x: 100 }}
                      transition={{
                        duration: 1 + i * 0.1,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "linear",
                      }}
                    />
                  ))}
                </div>

                {/* Quick Insights */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <QuickStatCard
                    icon={<Gauge className="w-5 h-5" />}
                    label="Speed"
                    value={`${quickStats.speed} km/h`}
                    color={activeDriver.teamColor}
                  />
                  <QuickStatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="RPM"
                    value={quickStats.rpm.toLocaleString()}
                    color={activeDriver.teamColor}
                  />
                  <QuickStatCard
                    icon={<Zap className="w-5 h-5" />}
                    label="ERS"
                    value={`${quickStats.ers}%`}
                    color={activeDriver.teamColor}
                  />
                  <QuickStatCard
                    icon={<Wind className="w-5 h-5" />}
                    label="DRS"
                    value={quickStats.drs}
                    color={activeDriver.teamColor}
                  />
                  <QuickStatCard
                    icon={<Gauge className="w-5 h-5" />}
                    label="Gear"
                    value={quickStats.gear.toString()}
                    color={activeDriver.teamColor}
                  />
                  <QuickStatCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Brake"
                    value={`${quickStats.brake}%`}
                    color={activeDriver.teamColor}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Telemetry Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Speed Graph */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`speed-${activeDriverId}`}
                className="glass-strong rounded-lg p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-bold text-f1light mb-3">Lap Speed (km/h)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={telemetryData}>
                    <defs>
                      <linearGradient id={`speedGradient-${activeDriverId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeDriver.teamColor} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={activeDriver.teamColor} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="lap" stroke="#F5F5F5" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#F5F5F5" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #DC0000',
                        borderRadius: '4px',
                        color: '#F5F5F5',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="speed"
                      stroke={activeDriver.teamColor}
                      strokeWidth={3}
                      fill={`url(#speedGradient-${activeDriverId})`}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>

            {/* RPM Graph */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`rpm-${activeDriverId}`}
                className="glass-strong rounded-lg p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-bold text-f1light mb-3">Lap RPM</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={telemetryData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="lap" stroke="#F5F5F5" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#F5F5F5" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E1E',
                        border: '1px solid #DC0000',
                        borderRadius: '4px',
                        color: '#F5F5F5',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rpm"
                      stroke={activeDriver.teamColor}
                      strokeWidth={3}
                      dot={false}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Race Predictions - Keys to Victory */}
          {favoriteDriver && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`ai-${activeDriverId}`}
                className="glass-strong rounded-lg p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-f1red" /> AI Race Strategy Prediction
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <motion.div
                      className="glass-light rounded-lg p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h4 className="font-bold text-f1red mb-1 flex items-center gap-1">
                        <Lightbulb className="w-4 h-4" /> Overtaking
                      </h4>
                      <p className="text-f1light/80 text-sm">
                        Focus on Turn 11-12 complex. Active Driver excels in late-apex maneuvers there.
                      </p>
                    </motion.div>

                    <motion.div
                      className="glass-light rounded-lg p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-bold text-f1red mb-1 flex items-center gap-1">
                        <Trophy className="w-4 h-4" /> Pit Strategy
                      </h4>
                      <p className="text-f1light/80 text-sm">
                        Pit Lap 18-22 for Hards. Single stop optimal based on 
                        current tire degradation rates.
                      </p>
                    </motion.div>

                    <motion.div
                      className="glass-light rounded-lg p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h4 className="font-bold text-f1red mb-1 flex items-center gap-1">
                        <Gauge className="w-4 h-4" /> Energy Use
                      </h4>
                      <p className="text-f1light/80 text-sm">
                        Prioritize ERS deployment on the back straight (Sector 2) for defense.
                      </p>
                    </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Next Race Countdown */}
      <motion.div 
        className="glass-strong rounded-lg p-8 shadow-lg card-hover relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {/* Background circuit lines animation */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 300 300" className="w-full h-full text-f1red">
            {/* Center circle */}
            <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
            {/* Pulsating center */}
            <motion.circle 
              cx="150" cy="150" r="10" fill="currentColor"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Radial lines */}
            {[0, 60, 120, 180, 240, 300].map((angle) => {
              const x1 = 150 + 100 * Math.cos((angle * Math.PI) / 180);
              const y1 = 150 + 100 * Math.sin((angle * Math.PI) / 180);
              const x2 = 150 + 140 * Math.cos((angle * Math.PI) / 180);
              const y2 = 150 + 140 * Math.sin((angle * Math.PI) / 180);
              return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="4" />;
            })}
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-f1red text-sm uppercase mb-1 tracking-widest">Next Race</div>
              <h2 className="text-3xl font-bold text-f1light">United States Grand Prix</h2>
              <p className="text-f1light/60 text-sm mt-1">Circuit of the Americas • Austin, Texas</p>
            </div>
            <motion.div
              className="w-12 h-12 rounded-full bg-f1red flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-6 h-6 text-f1light" />
            </motion.div>
          </div>

          {/* Countdown Display */}
          <div className="flex justify-around items-end">
            {Object.entries(countdown).map(([key, value], index) => (
              <motion.div 
                key={key} 
                className="relative text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="text-6xl font-extrabold text-f1light"
                    style={{
                      textShadow: '0 0 20px rgba(220, 0, 0, 0.5)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                    animate={{ opacity: [0.7, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", delay: index * 0.2 }}
                  >
                    {String(value).padStart(2, '0')}
                  </motion.div>
                  <div className="text-f1light/80 text-xs uppercase mt-2 tracking-wider font-bold">
                    {key}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Latest News */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-f1light">Latest News</h2>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/news')}
              className="flex items-center gap-2 text-f1red hover:text-f1red/80 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsArticles.slice(0, 3).map((article, index) => (
            <motion.div
              key={article.id}
              className="glass-strong rounded-lg overflow-hidden shadow-lg card-hover cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => onNavigate?.(`/news/${article.id}`)}
            >
              <div className="relative h-40 overflow-hidden">
                <motion.div
                  className="w-full h-full"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src={`https://source.unsplash.com/400x200/?f1,grandprix,racing,${article.id}`}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <div className="text-f1red text-xs uppercase mb-2">{article.category}</div>
                <h3 className="text-xl font-bold text-f1light mb-2">{article.title}</h3>
                <p className="text-f1light/80 line-clamp-2">{article.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Standings and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Standings */}
        <motion.div 
          className="glass-strong rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-f1red" /> Driver Standings
          </h2>
          <div className="space-y-1">
            {drivers.sort((a, b) => b.points - a.points).slice(0, 5).map((driver, index) => (
              <motion.div 
                key={driver.id} 
                className="flex items-center justify-between text-f1light hover:bg-white/5 p-2 rounded transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => onNavigate?.(`/driver/${driver.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold w-6">{index + 1}</div>
                  <div>{driver.name}</div>
                </div>
                <div className="font-bold text-f1red">{driver.points}</div>
              </motion.div>
            ))}
          </div>
          {onNavigate && (
            <motion.button
              onClick={() => onNavigate('/driver-standings')}
              className="w-full mt-4 text-f1red hover:text-f1red/80 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Standings →
            </motion.button>
          )}
        </motion.div>

        {/* Constructor Standings */}
        <motion.div 
          className="glass-strong rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-f1red" /> Constructor Standings
          </h2>
          <div className="space-y-1">
            {teams.sort((a, b) => b.points - a.points).slice(0, 5).map((team, index) => (
              <motion.div 
                key={team.id} 
                className="flex items-center justify-between text-f1light hover:bg-white/5 p-2 rounded transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => onNavigate?.(`/team/${team.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold w-6">{index + 1}</div>
                  <div>{team.name}</div>
                </div>
                <div className="font-bold text-f1red">{team.points}</div>
              </motion.div>
            ))}
          </div>
          {onNavigate && (
            <motion.button
              onClick={() => onNavigate('/constructor-standings')}
              className="w-full mt-4 text-f1red hover:text-f1red/80 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Standings →
            </motion.button>
          )}
        </motion.div>

        {/* Race Calendar */}
        <RaceCalendar />
      </div>
    </div>
  );
}

// Quick Stat Card Component
function QuickStatCard({ icon, label, value, color }) {
  return (
    <motion.div
      className="glass-light rounded-lg p-4 relative overflow-hidden text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto w-8 h-8 flex items-center justify-center mb-2" style={{ color: color }}>
        {icon}
      </div>
      <p className="text-f1light/60 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-f1light">{value}</p>

      {/* Color burst background effect */}
      <motion.div
        className="absolute inset-0 bg-opacity-20"
        style={{
          backgroundColor: color,
          clipPath: 'circle(15% at 50% 120%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.05, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}