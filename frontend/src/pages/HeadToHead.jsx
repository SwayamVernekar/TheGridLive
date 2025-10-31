import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DropdownSelect } from '../components/DropdownSelect';
import { generateLapTimes } from '../lib/mockData';

const driverOptions = [
  'Max Verstappen',
  'Sergio Perez',
  'Lewis Hamilton',
  'Charles Leclerc',
  'Lando Norris',
  'Carlos Sainz',
];

export function HeadToHead() {
  const [driver1, setDriver1] = useState('Max Verstappen');
  const [driver2, setDriver2] = useState('Lewis Hamilton');

  const data1 = generateLapTimes(driver1); // [{ lap: 1, time: 78.5 }, ...]
  const data2 = generateLapTimes(driver2);

  // Combine data by lap number
  const combinedData = data1.map((item, index) => ({
    lap: item.lap,
    [driver1]: item.time,
    [driver2]: data2[index]?.time ?? null,
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Head-to-Head Comparison</h1>

      {/* Driver Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DropdownSelect
          label="Select Driver 1"
          options={driverOptions}
          value={driver1}
          onChange={setDriver1}
        />
        <DropdownSelect
          label="Select Driver 2"
          options={driverOptions}
          value={driver2}
          onChange={setDriver2}
        />
      </div>

      {/* Chart */}
      <div className="bg-f1gray rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-f1light mb-4">Lap Time Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis 
              dataKey="lap" 
              stroke="#F5F5F5" 
              label={{ value: 'Lap Number', position: 'insideBottom', fill: '#F5F5F5' }}
            />
            <YAxis 
              stroke="#F5F5F5" 
              label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft', fill: '#F5F5F5' }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={driver1} stroke="#FF0000" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey={driver2} stroke="#00FF00" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
