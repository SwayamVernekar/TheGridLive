import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Award, Calendar, MapPin, Flag, TrendingUp, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDriverImage } from '../utils/imageUtils';

export function DriverDetails({ driverId, onNavigate }) {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDriverDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch drivers from API
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/data/drivers`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch driver data');
        }

        const data = await response.json();
        
        if (!data.drivers || data.drivers.length === 0) {
          throw new Error('No driver data available');
        }

        // Find the specific driver by ID (string comparison)
        const foundDriver = data.drivers.find(d => d.id === driverId || d.driverId === driverId);
        
        if (!foundDriver) {
          throw new Error('Driver not found');
        }

        setDriver(foundDriver);
      } catch (err) {
        console.error('Error loading driver details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDriverDetails();
  }, [driverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading driver details...</p>
        </div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-foreground mb-4">Driver Not Found</h1>
        <p className="text-f1light/60 mb-6">{error || 'The requested driver could not be found.'}</p>
        <button
          onClick={() => onNavigate('/drivers')}
          className="gradient-primary text-f1light py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.button
        onClick={() => onNavigate('/drivers')}
        className="flex items-center gap-2 text-f1red hover:text-f1red/80 transition-colors"
        whileHover={{ x: -5 }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Drivers
      </motion.button>

      {/* Hero Section */}
      <motion.div 
        className="glass-strong rounded-xl p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Team color accent */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{
            background: `linear-gradient(90deg, transparent, #${driver.teamColor || 'DC0000'}, transparent)`,
          }}
        />

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 rounded-full overflow-hidden ring-4 flex-shrink-0"
            style={{ ringColor: `#${driver.teamColor || 'DC0000'}` }}
          >
            <ImageWithFallback
              src={driver.driverImage || getDriverImage(driver.driverId || driver.driverCode)}
              alt={driver.fullName || 'Driver'}
              className="w-full h-full object-cover"
              type="driver"
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-black text-f1light mb-2">{driver.fullName || 'Unknown Driver'}</h1>
              <div className="flex items-center gap-3 text-xl text-f1light/80">
                <span className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: `#${driver.teamColor || 'FFFFFF'}` }}
                  />
                  {driver.team || 'Unknown Team'}
                </span>
                <span className="text-f1red font-bold">#{driver.number || 'N/A'}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Position" value={`P${driver.position || 'N/A'}`} icon={Trophy} />
              <StatCard label="Points" value={driver.points || 0} icon={Award} />
              <StatCard label="Wins" value={driver.wins || 0} icon={Flag} />
              <StatCard label="Podiums" value={driver.podiums || 0} icon={TrendingUp} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Driver Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div 
          className="glass-strong rounded-lg p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-f1light mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-f1red" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <InfoRow label="Full Name" value={driver.fullName || 'N/A'} />
            <InfoRow label="Nationality" value={driver.nationality || 'N/A'} />
            <InfoRow label="Date of Birth" value={driver.dateOfBirth ? new Date(driver.dateOfBirth).toLocaleDateString() : 'N/A'} />
            <InfoRow label="Driver Number" value={`#${driver.number || 'N/A'}`} />
            <InfoRow label="Driver Code" value={driver.code || 'N/A'} />
          </div>
        </motion.div>

        {/* Season Statistics */}
        <motion.div 
          className="glass-strong rounded-lg p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-f1light mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-f1red" />
            Season Statistics
          </h2>
          <div className="space-y-4">
            <InfoRow label="Current Position" value={`P${driver.position || 'N/A'}`} />
            <InfoRow label="Total Points" value={driver.points || 0} />
            <InfoRow label="Race Wins" value={driver.wins || 0} />
            <InfoRow label="Podium Finishes" value={driver.podiums || 0} />
            <InfoRow label="Team" value={driver.team || 'N/A'} />
          </div>
        </motion.div>
      </div>

      {/* Performance Visualization */}
      <motion.div 
        className="glass-strong rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-f1light mb-6">Season Performance</h2>
        
        <div className="space-y-6">
          {/* Points Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-f1light/80">Championship Points</span>
              <span className="text-f1light font-bold">{driver.points || 0} pts</span>
            </div>
            <div className="h-4 bg-f1dark rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #${driver.teamColor || 'DC0000'}, #DC0000)` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((driver.points || 0) / 600) * 100)}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
            <div className="text-xs text-f1light/60 mt-1">Relative to season maximum (~600 points)</div>
          </div>

          {/* Wins Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-f1light/80">Race Victories</span>
              <span className="text-f1light font-bold">{driver.wins || 0} wins</span>
            </div>
            <div className="h-4 bg-f1dark rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-f1red rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((driver.wins || 0) / 24) * 100)}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
            <div className="text-xs text-f1light/60 mt-1">Out of {24} races this season</div>
          </div>

          {/* Podiums Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-f1light/80">Podium Finishes</span>
              <span className="text-f1light font-bold">{driver.podiums || 0} podiums</span>
            </div>
            <div className="h-4 bg-f1dark rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #${driver.teamColor || 'DC0000'}, #FFA500)` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((driver.podiums || 0) / 24) * 100)}%` }}
                transition={{ duration: 1, delay: 1 }}
              />
            </div>
            <div className="text-xs text-f1light/60 mt-1">Maximum possible: {24} (3 per race × 24 races)</div>
          </div>
        </div>
      </motion.div>

      {/* Additional Info */}
      {driver.url && (
        <motion.div 
          className="glass-light rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold text-f1light mb-4">Learn More</h3>
          <a
            href={driver.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-f1red hover:text-f1red/80 underline"
          >
            View {driver.fullName}'s Wikipedia Page →
          </a>
        </motion.div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="glass-light rounded-lg p-4 text-center">
      <Icon className="w-5 h-5 text-f1red mx-auto mb-2" />
      <p className="text-f1light/60 text-xs mb-1">{label}</p>
      <p className="text-f1light font-bold text-xl">{value}</p>
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-f1light/10">
      <span className="text-f1light/60">{label}</span>
      <span className="text-f1light font-semibold">{value}</span>
    </div>
  );
}
