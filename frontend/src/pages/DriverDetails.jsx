import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Award } from 'lucide-react';
import { drivers } from '../lib/mockData';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DriverDetails({ driverId, onNavigate }) {
  const driver = drivers.find(d => d.id === driverId);

  if (!driver) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-foreground mb-4">Driver Not Found</h1>
        <button
          onClick={() => onNavigate('/drivers')}
          className="gradient-primary text-f1light py-2 px-6 rounded-lg"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  // Generate mock career timeline data
  const careerData = driver.careerYears.map((year, index) => ({
    year,
    position: Math.max(1, Math.floor(Math.random() * 10) + 1),
  }));

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.button
        onClick={() => onNavigate('/drivers')}
        className="flex items-center gap-2 text-f1red hover:text-f1red/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Drivers
      </motion.button>

      {/* Hero Section */}
      <motion.div className="glass-strong rounded-xl p-8 md:p-12 flex items-center gap-8">
        <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-f1red flex-shrink-0">
          <ImageWithFallback
            src={driver.image}
            alt={driver.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-f1light">{driver.name}</h1>
          <p className="text-f1light/80">{driver.team}</p>
          <p className="text-f1red font-bold">#{driver.number}</p>
          <p className="text-f1light/80">{driver.championships}x World Champion</p>
        </div>
      </motion.div>

      {/* Career Timeline */}
      <motion.div className="glass-strong rounded-lg p-6">
        <h2 className="text-xl font-bold text-f1light mb-4">Career Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={careerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="year" stroke="#F5F5F5" />
            <YAxis reversed domain={[1, 20]} stroke="#F5F5F5" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F1F1F', borderRadius: '8px', border: 'none' }}
              itemStyle={{ color: '#F5F5F5' }}
            />
            <Line type="monotone" dataKey="position" stroke={driver.teamColor} strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Race Highlight */}
      <motion.div className="glass-light rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-f1light">Race Highlight</h2>
        <p className="text-f1light/80 leading-relaxed">
          {driver.highlightText || `This race showcased ${driver.name}'s exceptional skill and determination.`}
        </p>

        {/* Race Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <StatBox label="Start" value={`P${driver.startPosition}`} />
          <StatBox label="Finish" value={`P${driver.finishPosition}`} />
          <StatBox label="Fastest Lap" value={driver.fastestLap} />
          <StatBox label="Pit Stops" value={driver.pitStops} />
        </div>
      </motion.div>

      {/* Achievement */}
      <motion.div className="glass-strong rounded-lg p-4 flex items-center gap-4">
        <Trophy className="w-8 h-8 text-f1red" />
        <div>
          <p className="text-f1light font-bold">Race Achievement</p>
          <p className="text-f1light/70 text-sm">{driver.achievement}</p>
        </div>
      </motion.div>
    </div>
  );
}

// Reusable Stat Box
function StatBox({ label, value }) {
  return (
    <div className="glass-light rounded-lg p-4 text-center">
      <p className="text-f1red font-bold text-sm">{label}</p>
      <p className="text-f1light font-bold text-2xl">{value}</p>
    </div>
  );
}
