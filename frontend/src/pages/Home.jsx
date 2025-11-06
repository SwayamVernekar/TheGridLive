import { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, ArrowRight, Gauge, Zap, Wind, TrendingUp, Lightbulb, Target, Calendar, MapPin, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDriverStandings, fetchSchedule, fetchNews, fetchTelemetry } from '../api/f1Api';
import { getDriverImage, getTeamImage, getPlaceholderImage } from '../utils/imageUtils';
import { ImageWithFallback } from '../components/ImageWithFallback';


export function Home({ onNavigate, favoriteDriver }) {
  const [drivers, setDrivers] = useState([]);
  const [nextRace, setNextRace] = useState(null);
  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const [newsArticles, setNewsArticles] = useState([]);
  const [telemetryData, setTelemetryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeDriverId, setActiveDriverId] = useState(favoriteDriver?.driverCode || null);

  // Generate generic mock telemetry data
  const generateMockTelemetry = useCallback(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      lap: i + 1,
      speed: 250 + Math.random() * 80,
      rpm: 11000 + Math.random() * 3000,
      throttle: 70 + Math.random() * 30,
      brake: Math.random() * 100,
    }));
  }, []);

  // Generate driver-specific telemetry data based on their performance
  const generateDriverSpecificTelemetry = useCallback((driver) => {
    if (!driver) return generateMockTelemetry();
    
    // Base stats on driver position and team performance
    const position = driver.position || 10;
    const points = driver.points || 0;
    
    // Better drivers have higher base speeds and more consistent performance
    const baseSpeed = position <= 3 ? 310 : position <= 7 ? 300 : position <= 15 ? 290 : 280;
    const speedVariation = position <= 3 ? 20 : position <= 7 ? 25 : 30;
    
    const baseRPM = position <= 3 ? 13000 : position <= 7 ? 12500 : 12000;
    const rpmVariation = 2000;
    
    return Array.from({ length: 25 }, (_, i) => {
      // Simulate tire degradation over laps
      const tireDegradation = Math.min(i / 25, 0.15);
      const lapSpeedModifier = 1 - tireDegradation;
      
      return {
        lap: i + 1,
        speed: (baseSpeed + Math.random() * speedVariation - speedVariation / 2) * lapSpeedModifier,
        rpm: baseRPM + Math.random() * rpmVariation - rpmVariation / 2,
        throttle: 75 + Math.random() * 20,
        brake: 15 + Math.random() * 25,
        position: position,
        compound: i < 15 ? 'SOFT' : 'MEDIUM',
        tyreLife: i < 15 ? i + 1 : i - 14
      };
    });
  }, [generateMockTelemetry]);

  // Fetch real data
  useEffect(() => {
    console.log('[Home] Starting to load data...');
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('[Home] Fetching standings, schedule, and news...');
        const [standingsResponse, scheduleResponse, newsResponse] = await Promise.all([
          fetchDriverStandings(),
          fetchSchedule(),
          fetchNews()
        ]);

        console.log('[Home] Responses received:', {
          standings: standingsResponse,
          schedule: scheduleResponse,
          news: newsResponse
        });

        if (standingsResponse.error) throw new Error(standingsResponse.error);
        if (scheduleResponse.error) throw new Error(scheduleResponse.error);

        setDrivers(standingsResponse.standings || []);
        setNextRace(scheduleResponse.nextRace);
        setUpcomingRaces((scheduleResponse.races || []).slice(0, 3));
        setNewsArticles(newsResponse.articles || []);

        console.log('[Home] Data set. Drivers count:', standingsResponse.standings?.length);

        if (!activeDriverId && standingsResponse.standings?.length > 0) {
          setActiveDriverId(standingsResponse.standings[0].driverCode);
          console.log('[Home] Set active driver to:', standingsResponse.standings[0].driverCode);
        }
      } catch (err) {
        console.error('[Home] Error loading home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        console.log('[Home] Loading complete');
      }
    };

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeDriver = useMemo(() => {
    console.log('[Home] Computing activeDriver. activeDriverId:', activeDriverId, 'drivers count:', drivers.length);
    const driver = drivers.find(d => d.driverCode === activeDriverId) || drivers[0];
    console.log('[Home] Active driver found:', driver?.fullName, driver?.driverCode);
    // Ensure teamColor is properly formatted
    if (driver && driver.teamColor) {
      driver.teamColor = driver.teamColor.startsWith('#') ? driver.teamColor : `#${driver.teamColor}`;
    }
    return driver;
  }, [drivers, activeDriverId]);

  // Debug: Track activeDriverId changes
  useEffect(() => {
    console.log('[Home] activeDriverId changed to:', activeDriverId);
  }, [activeDriverId]);

  // Fetch telemetry data when active driver changes
  useEffect(() => {
    const loadTelemetryData = async () => {
      if (!activeDriverId || !activeDriver) {
        console.log('[Home] Skipping telemetry load - no active driver');
        return;
      }

      try {
        setTelemetryLoading(true);
        console.log('[Home] Loading telemetry for driver:', activeDriverId, activeDriver.fullName);
        
        const telemetryResponse = await fetchTelemetry(activeDriverId, {
          year: new Date().getFullYear()
        });
        
        console.log('[Home] Telemetry response:', telemetryResponse);
        
        if (telemetryResponse.error || !telemetryResponse.data || telemetryResponse.data.length === 0) {
          console.warn('[Home] No telemetry data available, using simulated data based on driver stats');
          // Generate realistic data based on driver's actual performance
          setTelemetryData(generateDriverSpecificTelemetry(activeDriver));
        } else {
          console.log('[Home] Using real telemetry data:', telemetryResponse.data.length, 'laps');
          setTelemetryData(telemetryResponse.data);
        }
      } catch (err) {
        console.error('[Home] Error loading telemetry data:', err);
        // Use driver-specific simulated data as fallback
        setTelemetryData(generateDriverSpecificTelemetry(activeDriver));
      } finally {
        setTelemetryLoading(false);
      }
    };

    loadTelemetryData();
  }, [activeDriverId, activeDriver, generateDriverSpecificTelemetry]);

  // Update active driver when favorite changes
  useEffect(() => {
    if (favoriteDriver?.driverCode) {
      setActiveDriverId(favoriteDriver.driverCode);
    }
  }, [favoriteDriver]);

  // Countdown timer for next race
  useEffect(() => {
    if (!nextRace?.date || !nextRace?.time) return;

    const calculateCountdown = () => {
      const raceDateTime = new Date(`${nextRace.date}T${nextRace.time}`);
      const now = new Date();
      const diff = raceDateTime - now;

      if (diff <= 0) {
        // Race has passed, show zeros
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, [nextRace]);

  // Use telemetry data from state with fallback to driver-specific mock data
  const currentTelemetryData = useMemo(() => {
    console.log('[Home] Computing currentTelemetryData. telemetryData length:', telemetryData.length, 'activeDriver:', activeDriver?.fullName);
    return telemetryData.length > 0 
      ? telemetryData 
      : generateDriverSpecificTelemetry(activeDriver);
  }, [telemetryData, activeDriver, generateDriverSpecificTelemetry]);

  console.log('[Home] Render. activeDriverId:', activeDriverId, 'activeDriver:', activeDriver?.fullName, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-f1red border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-f1light/80">Loading home data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-strong rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-f1red mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-f1light mb-2">Error Loading Data</h2>
        <p className="text-f1light/80 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-f1red hover:bg-f1red/80 text-f1light font-bold py-2 px-6 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Safety check - if no drivers data, show loading state
  if (!loading && drivers.length === 0) {
    return (
      <div className="glass-strong rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-f1red mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-f1light mb-2">No Data Available</h2>
        <p className="text-f1light/80 mb-4">Unable to load driver standings. Please check if the backend server is running.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-f1red hover:bg-f1red/80 text-f1light font-bold py-2 px-6 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid Live Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Sidebar - Driver List */}
        <div className="xl:col-span-3 lg:col-span-3 space-y-4">
          <motion.div
            className="glass-strong rounded-lg p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-f1light mb-3">Driver Select</h2>

            {/* Quick Filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveDriverId(drivers[0]?.driverCode || null)}
                className="px-3 py-1 text-xs bg-f1red/20 text-f1red rounded-full hover:bg-f1red/30 transition-colors"
              >
                All Drivers
              </button>
              {[...new Set(drivers.map(d => d.constructorName))].slice(0, 4).map(team => (
                <button
                  key={team}
                  onClick={() => {
                    const teamDrivers = drivers.filter(d => d.constructorName === team);
                    setActiveDriverId(teamDrivers[0]?.driverCode || null);
                  }}
                  className="px-3 py-1 text-xs bg-f1dark text-f1light rounded-full hover:bg-f1red/30 transition-colors"
                >
                  {team.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {console.log('[Home] Rendering driver list. Drivers:', drivers.length)}
              {drivers.length === 0 ? (
                <div className="text-f1light/60 text-center py-4">No drivers available</div>
              ) : (
                drivers.map((driver, index) => {
                  const isActive = activeDriverId === driver.driverCode;
                  console.log('[Home] Driver render:', driver.fullName, 'code:', driver.driverCode, 'isActive:', isActive);
                  return (
                  <motion.div
                    key={driver.driverCode || driver.driverId || `driver-${index}`}
                    className={`p-3 rounded-lg cursor-pointer transition-all relative overflow-hidden ${
                      isActive ? 'glass-light' : 'hover:bg-white/5'
                    }`}
                    onClick={() => {
                      console.log('[Home] Driver clicked:', driver.driverCode, driver.fullName);
                      console.log('[Home] Current activeDriverId before:', activeDriverId);
                      setActiveDriverId(driver.driverCode);
                      console.log('[Home] Setting activeDriverId to:', driver.driverCode);
                    }}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                  {/* Active driver highlight ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        boxShadow: `inset 0 0 20px ${(driver.teamColor || '#DC0000')}40`,
                        border: `1px solid ${(driver.teamColor || '#DC0000')}80`,
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
                        style={{ backgroundColor: driver.teamColor || '#DC0000' }}
                      />
                    </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-f1light font-bold truncate">{driver.fullName || (driver.givenName && driver.familyName ? `${driver.givenName} ${driver.familyName}` : 'Unknown Driver')}</div>
                      <div className="text-f1light/60 text-xs truncate">{driver.constructorName}</div>
                    </div>
                    <div className="text-f1red font-bold text-sm">P{driver.position || '?'}</div>
                  </div>
                </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Active Driver Car Display */}
          {activeDriver ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`driver-${activeDriverId}-${activeDriver?.fullName}`}
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
                    <h2 className="text-4xl font-extrabold text-f1light">{activeDriver.fullName}</h2>
                    <p className="text-f1light/70 text-lg" style={{ color: activeDriver.teamColor }}>{activeDriver.constructorName}</p>
                  </div>
                  <motion.button
                    className="bg-f1red hover:bg-f1red/80 text-f1light font-bold py-2 px-4 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate?.(`/drivers`)}
                  >
                    View Full Stats
                  </motion.button>
                </div>

                {/* Driver Image */}
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
                    {(() => {
                      const imageSrc = activeDriver.driverImage && activeDriver.driverImage.startsWith('/images/') 
                        ? activeDriver.driverImage 
                        : getDriverImage(
                            activeDriver.driverId || 
                            (activeDriver.givenName === 'Max' && activeDriver.familyName === 'Verstappen' 
                              ? 'max_verstappen' 
                              : activeDriver.familyName) || 
                            activeDriver.driverCode
                          );
                      console.log('[Home] Driver image src:', imageSrc, 'for driver:', activeDriver.fullName);
                      return (
                        <ImageWithFallback
                          src={imageSrc}
                          alt={activeDriver.fullName}
                          className="max-h-full object-contain drop-shadow-2xl"
                          type="driver"
                        />
                      );
                    })()}
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

                {/* Driver Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickStatCard
                    key="points"
                    icon={<Trophy />}
                    label="Points"
                    value={activeDriver.points || 0}
                    color={activeDriver.teamColor || '#DC0000'}
                  />
                  <QuickStatCard
                    key="wins"
                    icon={<Award />}
                    label="Wins"
                    value={activeDriver.wins || 0}
                    color={activeDriver.teamColor || '#DC0000'}
                  />
                  <QuickStatCard
                    key="position"
                    icon={<TrendingUp />}
                    label="Position"
                    value={`P${activeDriver.position || '?'}`}
                    color={activeDriver.teamColor || '#DC0000'}
                  />
                  <QuickStatCard
                    key="number"
                    icon={<Target />}
                    label="Number"
                    value={`#${activeDriver.driverNumber || activeDriver.number || '?'}`}
                    color={activeDriver.teamColor || '#DC0000'}
                  />
                </div>


              </div>
            </motion.div>
          </AnimatePresence>
          ) : (
            <div className="glass-strong rounded-lg p-8 text-center">
              <p className="text-f1light/60">No driver selected</p>
            </div>
          )}

          {/* Telemetry Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Loading State for Telemetry */}
            {telemetryLoading ? (
              <motion.div
                className="glass-strong rounded-lg p-6 col-span-2 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-8 h-8 border-4 border-f1red border-t-transparent rounded-full mx-auto mb-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-f1light/60">Loading telemetry data...</p>
                </div>
              </motion.div>
            ) : activeDriver ? (
              <>
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
                    <h3 className="text-lg font-bold text-f1light mb-3 flex items-center justify-between">
                      <span>Lap Speed (km/h)</span>
                      {telemetryData.length === 0 && (
                        <span className="text-xs text-f1light/50 font-normal">Simulated Data</span>
                      )}
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={currentTelemetryData}>
                        <defs>
                          <linearGradient id={`speedGradient-${activeDriverId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={activeDriver?.teamColor || '#DC0000'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={activeDriver?.teamColor || '#DC0000'} stopOpacity={0.1}/>
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
                          stroke={activeDriver?.teamColor || '#DC0000'}
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
                    <h3 className="text-lg font-bold text-f1light mb-3 flex items-center justify-between">
                      <span>Lap RPM</span>
                      {telemetryData.length === 0 && (
                        <span className="text-xs text-f1light/50 font-normal">Simulated Data</span>
                      )}
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={currentTelemetryData}>
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
                          stroke={activeDriver?.teamColor || '#DC0000'}
                          strokeWidth={3}
                          dot={false}
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : null}
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
              <h2 className="text-3xl font-bold text-f1light">{nextRace?.raceName || 'Loading...'}</h2>
              <p className="text-f1light/60 text-sm mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {nextRace?.circuitName || ''} • {nextRace?.locality}, {nextRace?.country}
              </p>
              {nextRace?.date && (
                <p className="text-f1light/60 text-sm mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(nextRace.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
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
              key={article.url || index}
              className="glass-strong rounded-lg overflow-hidden shadow-lg card-hover cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => article.url && window.open(article.url, '_blank')}
            >
              <div className="relative h-40 overflow-hidden">
                <motion.div
                  className="w-full h-full"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src={article.urlToImage || `/images/news-placeholder.png`}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    type="news"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <div className="text-f1red text-xs uppercase mb-2">{article.source?.name || 'F1 News'}</div>
                <h3 className="text-xl font-bold text-f1light mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-f1light/80 line-clamp-2 text-sm">{article.description || ''}</p>
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
            {drivers.slice(0, 5).map((driver, index) => (
              <motion.div 
                key={driver.driverCode} 
                className="flex items-center justify-between text-f1light hover:bg-white/5 p-2 rounded transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onClick={() => onNavigate?.('/drivers')}
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold w-6">{driver.position || '?'}</div>
                  <div>{driver.fullName || `${driver.givenName || ''} ${driver.familyName || ''}`.trim() || 'Unknown Driver'}</div>
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

        {/* Constructor Standings - Hidden since we don't have constructor standings on home */}
        
        {/* Race Calendar */}
        <motion.div 
          className="glass-strong rounded-lg p-6 shadow-lg lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-f1light mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-f1red" /> Upcoming Races
          </h2>
          <div className="space-y-3">
            {upcomingRaces.map((race, index) => (
              <motion.div 
                key={race.round}
                className="flex items-center justify-between text-f1light hover:bg-white/5 p-3 rounded transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex-1">
                  <div className="font-bold">{race.raceName}</div>
                  <div className="text-sm text-f1light/60">{race.circuitName}</div>
                </div>
                <div className="text-right">
                  <div className="text-f1red font-bold">
                    {new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-f1light/60">{race.locality}</div>
                </div>
              </motion.div>
            ))}
          </div>
          {onNavigate && upcomingRaces.length > 0 && (
            <motion.button
              onClick={() => onNavigate('/schedule')}
              className="w-full mt-4 text-f1red hover:text-f1red/80 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Full Calendar →
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-f1light/60">Loading...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div 
          className="glass-strong rounded-lg p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-12 h-12 text-f1red mx-auto mb-4" />
          <h3 className="text-xl font-bold text-f1light mb-2">Failed to Load Data</h3>
          <p className="text-f1light/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-f1red hover:bg-f1red/80 text-f1light font-bold py-2 px-6 rounded-full transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}
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