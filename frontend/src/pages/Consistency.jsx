import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DropdownSelect } from '../components/DropdownSelect';
import { generateConsistencyData } from '../lib/mockData';

const driverOptions = [
  'Max Verstappen',
  'Sergio Perez',
  'Lewis Hamilton',
  'Charles Leclerc',
  'Lando Norris',
  'Carlos Sainz',
];

export function Consistency() {
  const [selectedDriver, setSelectedDriver] = useState('Max Verstappen');

  const allDriversData = generateConsistencyData(driverOptions);

  const data = allDriversData.map((item) => ({
    driver: item.driver.split(' ').pop(), // Last name
    stdDev: item.stdDev,
    fill: item.fill || '#f87171', // fallback color
  }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Driver Consistency Analysis</h1>

      {/* Driver Selector */}
      <div className="mb-8 max-w-md">
        <DropdownSelect
          label="Select Driver"
          options={driverOptions}
          value={selectedDriver}
          onChange={setSelectedDriver}
        />
      </div>

      {/* Chart */}
      <div className="bg-f1gray rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold text-f1light mb-4">Lap Time Standard Deviation</h2>
        <p className="text-f1light/80 mb-4">Lower values indicate more consistent lap times</p>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="driver" stroke="#F5F5F5" />
            <YAxis
              stroke="#F5F5F5"
              label={{ value: 'Lap Std Dev (s)', angle: -90, position: 'insideLeft', fill: '#F5F5F5' }}
            />
            <Tooltip />
            <Bar dataKey="stdDev" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
