import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// Assuming these imports exist and work
// import { DropdownSelect } from '../components/DropdownSelect';
// import { generateLapTimes } from '../lib/mockData';

// --- MOCK DATA/COMPONENTS (Simulated for correctness) ---
const driverOptions = [
  'Max Verstappen',
  'Sergio Perez',
  'Lewis Hamilton',
  'Charles Leclerc',
  'Lando Norris',
  'Carlos Sainz',
];

// Mock Lap Time Generator
const generateLapTimes = (driver, laps) => {
    const base = driver === 'Max Verstappen' ? 95 : driver === 'Lewis Hamilton' ? 96 : 97;
    return Array.from({ length: laps }, (_, i) => ({
        lap: i + 1,
        time: base + (i * 0.1) + (Math.random() * 0.5 - 0.2), // simulating slow degradation
        teamColor: driver === 'Max Verstappen' || driver === 'Sergio Perez' ? '#0600EF' : '#00D2BE',
    }));
};

// Mock DropdownSelect Component
const DropdownSelect = ({ label, options, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-f1light/60 text-sm">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-f1light focus:ring-f1red focus:border-f1red"
        >
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);
// -----------------------------------------------------------


// Generate tire degradation data - Removed TS annotations
const generateTireDegradation = (driver) => {
  const laps = 30;
  const data = [];

  for (let i = 1; i <= laps; i++) {
    // Removed TS annotations
    const degradation = Math.min(100, (i / laps) * 100 + Math.random() * 10);
    // Determine color based on degradation
    let color = '#22c55e'; // green
    if (degradation > 70) color = '#ef4444'; // red
    else if (degradation > 30) color = '#f97316'; // orange

    data.push({
      lap: i,
      degradation,
      color,
    });
  }

  return data;
};

export function RacePace() {
  const [selectedDriver, setSelectedDriver] = useState('Max Verstappen');

  const lapTimeData = generateLapTimes(selectedDriver, 30);
  const tireDegradationData = generateTireDegradation(selectedDriver);

  // Determine the primary color for the Lap Time line
  const driverColor = lapTimeData.length > 0 ? lapTimeData[0].teamColor : '#F5F5F5';


  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-f1light mb-6">Race Pace Analysis</h1>

      {/* Driver Selector */}
      <div className="mb-8 max-w-md">
        <DropdownSelect
          label="Select Driver"
          options={driverOptions}
          value={selectedDriver}
          onChange={setSelectedDriver}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === COLUMN 1: LAP TIME PROGRESSION (The missing chart) === */}
        <motion.div 
          className="glass-strong rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-f1light mb-4">Lap Time Progression</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lapTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="lap" stroke="#F5F5F5" />
              <YAxis 
                dataKey="time"
                stroke="#F5F5F5" 
                tickFormatter={(tick) => `${tick.toFixed(1)}s`}
                // Set domain dynamically or use a fixed one based on race norms (e.g., 90-100s)
                domain={['dataMin - 1', 'dataMax + 0.5']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0B0B', border: '1px solid #00D2BE', borderRadius: 4, color: '#F5F5F5' }}
                // Removed TS annotation
                formatter={(value) => [`${value.toFixed(3)}s`, 'Lap Time']} 
              />
              <Line 
                type="monotone" 
                dataKey="time" 
                stroke={driverColor}
                strokeWidth={3}
                dot={false}
                isAnimationActive={true}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* === COLUMN 2: TIRE DEGRADATION (The original chart) === */}
        <motion.div 
          className="glass-strong rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }} // Added delay for staggered animation
        >
          <h2 className="text-xl font-bold text-f1light mb-4">Tire Degradation (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tireDegradationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="lap" stroke="#F5F5F5" />
              <YAxis domain={[0, 100]} stroke="#F5F5F5" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0B0B', border: '1px solid #DC0000', borderRadius: 4, color: '#F5F5F5' }}
                // Removed TS annotation
                formatter={(value) => [`${value.toFixed(1)}%`, 'Wear']}
              />
              <Line 
                type="monotone" 
                dataKey="degradation" 
                stroke="#DC0000"
                strokeWidth={4}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={payload.color}
                      stroke={payload.color}
                      strokeWidth={2}
                    />
                  );
                }}
                isAnimationActive={true}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-f1light/80">Fresh (0-30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-f1light/80">Used (30-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-f1light/80">Critical (70%+)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}