// drivers.js (Corrected and complete mockData.js)
export const drivers = [
  {
    id: 1,
    name: 'Max Verstappen',
    number: 1,
    team: 'Red Bull',
    teamId: 1,
    teamColor: '#0600ef',
    points: 450,
    wins: 14,
    podiums: 20,
    poles: 5,
    fastestLaps: 8,
    championships: 2,
    nationality: 'Dutch',
    nickname: 'Mad Max',
    famousQuote: 'I push until the last lap.',
    careerYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  },
  {
    id: 2,
    name: 'Lewis Hamilton',
    number: 44,
    team: 'Mercedes',
    teamId: 2,
    teamColor: '#00d2be',
    points: 380,
    wins: 11,
    podiums: 18,
    poles: 6,
    fastestLaps: 5,
    championships: 7,
    nationality: 'British',
    nickname: 'Ham',
    famousQuote: 'You cannot have the drink.',
    careerYears: [2020, 2021, 2022, 2023, 2024, 2025],
  },
  {
    id: 3,
    name: 'Charles Leclerc',
    number: 16,
    team: 'Ferrari',
    teamId: 3,
    teamColor: '#dc0000',
    points: 320,
    wins: 5,
    podiums: 10,
    poles: 3,
    fastestLaps: 4,
    championships: 0,
    nationality: 'Monegasque',
    nickname: 'Charles',
    famousQuote: 'Racing is life.',
    careerYears: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
  },
  {
    id: 4,
    name: 'Lando Norris',
    number: 4,
    team: 'McLaren',
    teamId: 4,
    teamColor: '#ff8700',
    points: 200,
    wins: 1,
    podiums: 4,
    poles: 1,
    fastestLaps: 0,
    championships: 0,
    nationality: 'British',
    nickname: 'Lando',
    famousQuote: 'Keep pushing!',
    careerYears: [2024, 2025],
  },
  // Add other drivers similarly...
];

export const teams = [
  {
    id: 1,
    name: 'Red Bull Racing',
    points: 850,
    wins: 20,
    color: '#0600ef',
    base: 'United Kingdom',
    teamPrincipal: 'Christian Horner',
    engineSupplier: 'Red Bull Powertrains',
    firstSeason: 2005,
    championships: 5,
    drivers: [1, 2], // driver ids
  },
  {
    id: 2,
    name: 'Mercedes AMG',
    points: 700,
    wins: 15,
    color: '#00d2be',
    base: 'United Kingdom',
    teamPrincipal: 'Toto Wolff',
    engineSupplier: 'Mercedes',
    firstSeason: 2010,
    championships: 8,
    drivers: [3, 4],
  },
  // Add other teams similarly...
];

export const newsArticles = [
  {
    id: 1,
    title: 'Verstappen Dominates the Race',
    description: 'Max Verstappen wins the 2025 Grand Prix in a spectacular fashion.',
    category: 'Race',
  },
  {
    id: 2,
    title: 'Mercedes Secures Podium',
    description: 'Lewis Hamilton finishes second, marking a new era for the legendary team.',
    category: 'Team',
  },
  // Add other articles similarly...
];

export const chatRooms = [
  { id: 1, name: 'General Chat', isPrivate: false },
  { id: 2, name: 'Race Strategy', isPrivate: true },
  { id: 3, name: 'Drivers Lounge', isPrivate: true },
  { id: 4, name: 'Fans', isPrivate: false },
];

export const chatMessages = [
  { id: 1, user: 'Max', avatar: 'max.png', message: 'Good luck everyone!', timestamp: '2025-10-27T00:00:00Z' },
  { id: 2, user: 'Lewis', avatar: 'lewis.png', message: 'Thanks Max!', timestamp: '2025-10-27T00:01:00Z' },
  // Add more messages similarly...
];

// Lap times generator
export const generateLapTimes = (driver, numLaps) => {
  const baseTimes = {
    'Max Verstappen': 92.3,
    'Sergio Perez': 93.1,
    'Lewis Hamilton': 92.8,
    'Charles Leclerc': 93.5,
    'Lando Norris': 94.0,
    'Carlos Sainz': 93.9,
  };

  const baseTime = baseTimes[driver] || 93;

  return Array.from({ length: numLaps }, (_, i) => ({
    lap: i + 1,
    time: baseTime + Math.random() * 1.5 - 0.5,
  }));
};

// Circuit data
export const circuits = [
  {
    id: 1,
    name: 'Monaco Grand Prix',
    country: 'Monaco',
    length: 3.337,
    laps: 78,
    corners: 19,
    drsZones: 1,
    lapRecord: 72.3,
    difficulty: 'High',
    pathData: 'M150 L100,150 Q150,150 150,100 L150,50 Q150,20 120,20 L80,20 Q50,20 50,50 L50,100 Q50,125 75,125 L125,125',
  },
  {
    id: 2,
    name: 'Silverstone Circuit',
    country: 'UK',
    length: 5.891,
    laps: 52,
    corners: 18,
    drsZones: 2,
    lapRecord: 85.2,
    difficulty: 'Medium',
    pathData: 'M100 L80,100 Q90,100 90,90 L90,60 Q90,50 100,50 L140,50 Q150,50 150,60 L150,120 Q150,130 140,130 L60,130 Q50,130 50,120 Z',
  },
  // Add other circuits similarly...
];

// MOCK FUNCTION REQUIRED BY CONSISTENCY.JSX
export const generateConsistencyData = (driverId, laps = 50) => {
    // Mock logic: Lower driverId/higher wins = better consistency (lower deviation)
    const driver = drivers.find(d => d.id === driverId);
    const baseDeviation = 0.5 - (driver ? driver.wins * 0.01 : 0);
    
    return Array.from({ length: laps }, (_, i) => ({
        lap: i + 1,
        // Calculate deviation with random noise
        deviation: parseFloat((baseDeviation + (Math.random() * 0.2 - 0.1)).toFixed(2)),
    }));
};