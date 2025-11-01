import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { fetchSchedule } from '../api/f1Api';

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

export function Schedule({ onNavigate }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchSchedule(season);

        if (response.error) {
          throw new Error(response.error);
        }

        if (!response.races || response.races.length === 0) {
          throw new Error('No schedule data available for this season');
        }

        setSchedule(response);
      } catch (err) {
        console.error('Error loading schedule:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [season]);

  const calculateCountdown = (raceDate, raceTime) => {
    if (!raceDate || !raceTime) return null;

    const raceDateTime = new Date(`${raceDate}T${raceTime}`);
    const now = new Date();
    const diff = raceDateTime - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-f1red animate-spin mx-auto mb-4" />
          <p className="text-f1light/60">Loading race schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-2">Error Loading Schedule</h3>
        <p className="text-f1light/80">{error}</p>
        <p className="text-f1light/60 text-sm mt-2">
          Make sure the backend is running and connected to the data source.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-f1red text-white rounded hover:bg-f1red/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { races, nextRace } = schedule;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Race Schedule</h1>
          <p className="text-foreground/60">{season} Formula 1 World Championship</p>
        </div>
        <select
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
          className="bg-f1dark text-f1light px-4 py-2 rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
        </select>
      </div>

      {/* Next Race Highlight */}
      {nextRace && (
        <motion.div
          className="glass-strong rounded-lg p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-f1red" />
                <span className="text-f1red font-bold">Next Race</span>
              </div>
              <h2 className="text-2xl font-bold text-f1light mb-1">{nextRace.raceName}</h2>
              <p className="text-f1light/80 mb-4">{nextRace.circuitName} • {nextRace.locality}, {nextRace.country}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-f1light/60" />
                  <span className="text-f1light/60">
                    {new Date(nextRace.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {nextRace.time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-f1light/60" />
                    <span className="text-f1light/60">{nextRace.time} UTC</span>
                  </div>
                )}
              </div>
            </div>

            {/* Countdown */}
            {(() => {
              const countdown = calculateCountdown(nextRace.date, nextRace.time);
              return countdown ? (
                <div className="text-right">
                  <div className="text-f1light/60 text-sm mb-1">Countdown</div>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-f1red">{countdown.days}</div>
                      <div className="text-xs text-f1light/60">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-f1red">{countdown.hours}</div>
                      <div className="text-xs text-f1light/60">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-f1red">{countdown.minutes}</div>
                      <div className="text-xs text-f1light/60">Min</div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </motion.div>
      )}

      {/* Race List */}
      <div className="grid gap-4">
        {races.map((race, index) => {
          const isCompleted = race.status === 'completed';
          const isNext = nextRace && race.round === nextRace.round;
          const countdown = calculateCountdown(race.date, race.time);

          return (
            <motion.div
              key={race.round}
              className={`glass-strong rounded-lg p-6 relative overflow-hidden ${
                isNext ? 'ring-2 ring-f1red' : ''
              } ${isCompleted ? 'opacity-75' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-400'
                    : isNext
                    ? 'bg-f1red/20 text-f1red'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isCompleted ? 'Completed' : isNext ? 'Next Race' : 'Upcoming'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Round Number */}
                  <div className="w-12 h-12 rounded-full bg-f1red flex items-center justify-center font-bold text-f1light">
                    {race.round}
                  </div>

                  {/* Race Details */}
                  <div>
                    <h3 className="text-xl font-bold text-f1light mb-1">{race.raceName}</h3>
                    <div className="flex items-center gap-4 text-sm text-f1light/80">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{race.circuitName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(race.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {race.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{race.time} UTC</span>
                        </div>
                      )}
                    </div>
                    <p className="text-f1light/60 text-sm mt-1">{race.locality}, {race.country}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-right">
                  {isCompleted ? (
                    <button
                      onClick={() => onNavigate?.(`/race-results/${season}/${race.round}`)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      View Results
                    </button>
                  ) : countdown ? (
                    <div className="text-sm text-f1light/60">
                      {countdown.days}d {countdown.hours}h {countdown.minutes}m
                    </div>
                  ) : (
                    <div className="text-sm text-f1light/60">TBD</div>
                  )}
                </div>
              </div>

              {/* Background Image */}
              <div className="absolute inset-0 opacity-5">
                <ImageWithFallback
                  src={`https://source.unsplash.com/800x400/?f1,circuit,${race.circuitId}`}
                  alt={race.circuitName}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
