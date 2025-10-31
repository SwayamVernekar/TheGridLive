import { Calendar, MapPin } from 'lucide-react';

const upcomingRaces = [
  { id: 1, name: 'United States Grand Prix', location: 'Austin, Texas', date: 'Oct 27, 2025', status: 'next' },
  { id: 2, name: 'Mexico City Grand Prix', location: 'Mexico City, Mexico', date: 'Nov 3, 2025', status: 'pending' },
  { id: 3, name: 'São Paulo Grand Prix', location: 'São Paulo, Brazil', date: 'Nov 10, 2025', status: 'pending' },
  { id: 4, name: 'Las Vegas Grand Prix', location: 'Las Vegas, Nevada', date: 'Nov 24, 2025', status: 'pending' },
];

export function RaceCalendar() {
  return (
    <div className="bg-f1gray rounded-lg p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-f1red" />
        <h2 className="text-xl font-bold text-f1light">Upcoming Races</h2>
      </div>
      
      <div className="space-y-3">
        {upcomingRaces.map((race) => (
          <div 
            key={race.id}
            className={`p-4 rounded-lg border-l-4 ${
              race.status === 'next' 
                ? 'bg-f1red/10 border-f1red' 
                : 'bg-f1dark border-f1light/20'
            } hover:bg-f1red/20 transition-colors cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-f1light font-bold">{race.name}</h3>
                  {race.status === 'next' && (
                    <span className="text-xs bg-f1red text-f1light px-2 py-0.5 rounded">NEXT</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-f1light/60 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{race.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-f1light text-sm">{race.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}