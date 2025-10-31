import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' for 'motion'
import { Radio, Send, Volume2, Signal, Mic, Users } from 'lucide-react'; // Removed unused imports

// --- MOCK DATA (Replace with your actual imports) ---
const chatRooms = [
  { id: 1, name: "Paddock Club", description: "General Chat", users: 150 },
  { id: 2, name: "VERSTAPPEN FANS", description: "Max's corner", users: 85 },
  { id: 3, name: "MERCEDES TECH", description: "W16 Discussion", users: 45 },
  { id: 4, name: "RACE STRATEGY", description: "Live Analysis", users: 210 },
];
const chatMessages = [
  { id: 1, avatar: 'VER', user: 'RacerMax', message: 'That last sector was immense! 🔥', time: '1:32' },
  { id: 2, avatar: 'HAM', user: 'LewisFan44', message: 'We need that Hard tyre now, strategy is key!', time: '1:33' },
  { id: 3, avatar: 'LEC', user: 'Charles_Slayer', message: 'Pressure mounting on Leclerc, hope the tires hold up.', time: '1:34' },
  { id: 4, avatar: 'NOR', user: 'Lando_Lover', message: 'Lando pushing the limits, great pace!', time: '1:35' },
];
// ---------------------------------------------------


export function Social() {
  const [selectedRoom, setSelectedRoom] = useState(chatRooms[0]);
  const [message, setMessage] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [playStaticSound, setPlayStaticSound] = useState(false);
  // Removed TypeScript type annotation <HTMLDivElement>
  const messagesEndRef = useRef(null); 

  const scrollToBottom = () => {
    // Used optional chaining, which is valid in modern JS/JSX
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Using chatMessages directly in useEffect dependencies requires the actual data array to be stable. 
  // Since it's mock/imported, it's assumed stable. For a real app, use a state variable.
  const motionRepeat = Infinity; // Define motionRepeat variable
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = () => {
    if (message.trim()) {
      // Trigger static sound effect visual
      setPlayStaticSound(true);
      setTimeout(() => setPlayStaticSound(false), 300);
      console.log('Sending message:', message);
      // In a real app, you would dispatch an action to add the message to the chatMessages state/store
      setMessage('');
    }
  };

  // Driver number colors (mock - based on team colors)
  // Removed TypeScript type annotation
  const driverColors = {
    'VER': '#0600EF', // Red Bull blue (using team colors for example)
    'HAM': '#00D2BE', // Mercedes teal
    'LEC': '#DC0000', // Ferrari red
    'NOR': '#FF8700', // McLaren orange
    'SAI': '#DC0000', // Ferrari red
  };

  // Constants for motion
  const motionDuration = 2;


  return (
    <div className="p-4 md:p-8">
      {/* Header with radio theme */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className="flex items-center gap-2 glass-strong px-4 py-2 rounded-lg"
          animate={{ 
            boxShadow: ['0 0 0px rgba(220, 0, 0, 0)', '0 0 20px rgba(220, 0, 0, 0.5)', '0 0 0px rgba(220, 0, 0, 0)'],
          }}
          transition={{ duration: 3, repeat: motionRepeat, repeatType: "reverse" }}
        >
          <Radio className="w-6 h-6 text-f1red" />
          <h1 className="text-2xl font-bold text-f1light font-mono">GRID COMMS</h1>
        </motion.div>
        
        {/* Static noise indicator */}
        <AnimatePresence>
          {playStaticSound && (
            <motion.div
              className="text-f1red font-mono text-sm flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
            >
              <Signal className="w-4 h-4" />
              TRANSMITTING...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[70vh]">
        
        {/* Channel List - Styled like radio frequencies */}
        <div className="lg:col-span-1 glass-strong rounded-lg p-4 shadow-lg overflow-y-auto max-h-[70vh]">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-f1red" />
            <h2 className="text-xl font-bold text-f1light">Channels</h2>
          </div>
          
          <div className="space-y-2">
            {chatRooms.map((room) => (
              <motion.button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all font-mono ${
                  selectedRoom.id === room.id
                    ? 'bg-f1red text-f1light shadow-lg'
                    : 'glass-light text-f1light/80 hover:bg-f1red/20'
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <div className="text-sm truncate">{room.name}</div>
                  <div className="text-f1light/60 text-xs">{room.description}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                    <Users className="w-4 h-4" />
                    {room.users}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Signal indicator */}
          <div className="mt-6 pt-4 border-t border-f1light/10">
            <div className="text-f1light/60 text-xs uppercase mb-2">Signal Strength</div>
            <div className="flex items-end gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-f1red rounded-t"
                  style={{ height: `${(i + 1) * 20}%` }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: motionRepeat, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Radio Communication Window */}
        <div className="lg:col-span-3 glass-strong rounded-lg shadow-lg flex flex-col overflow-hidden border border-f1red/20">
          {/* Header - Radio control panel style */}
          <div className="p-4 border-b border-f1red/20 bg-gradient-to-r from-f1dark/50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-f1light font-mono">{selectedRoom.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-f1red rounded-full animate-pulse" />
                  <span className="text-f1light/60 text-xs uppercase tracking-wider">Live Feed</span>
                </div>
              </div>
              
              {/* Frequency display */}
              <div className="glass-light px-4 py-2 rounded font-mono">
                <div className="text-f1light/60 text-xs">FREQ</div>
                <div className="text-f1red font-bold">146.{selectedRoom.id}0 MHz</div>
              </div>
            </div>
          </div>

          {/* Messages - Radio transmission style */}
          <div 
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-f1dark/20 custom-scrollbar"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgba(220, 0, 0, 0.02) 0px,
                  transparent 2px,
                  transparent 4px,
                  rgba(220, 0, 0, 0.02) 6px
                )
              `,
            }}
          >
            <AnimatePresence initial={false}>
              {chatMessages.map((msg, index) => {
                const driverCode = msg.avatar;
                const driverColor = driverColors[driverCode] || '#DC0000';
                
                return (
                  <motion.div 
                    key={msg.id}
                    className="glass-light rounded-lg p-4 border border-f1light/10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="font-extrabold text-sm px-2 py-1 rounded" 
                          style={{ backgroundColor: driverColor, color: '#000' }}
                        >
                          {driverCode}
                        </div>
                        <div className="font-bold text-f1light">{msg.user}</div>
                        <div className="text-f1light/60 text-xs font-mono">{msg.time}</div>
                      </div>
                      <Mic className="w-4 h-4 text-f1light/40" />
                    </div>

                    <div className="ml-2 border-l-2 pl-3" style={{ borderColor: driverColor }}>
                      <div className="text-f1light/80 text-sm">
                        
                        <motion.div
                          className="relative inline-block text-f1light/90 font-mono"
                          // Static noise effect on text
                          animate={{
                            boxShadow: ['0 0 0px rgba(220, 0, 0, 0)', '0 0 5px rgba(220, 0, 0, 0.2)', '0 0 0px rgba(220, 0, 0, 0)'],
                          }}
                          transition={{ duration: 4, repeat: motionRepeat }}
                        >
                          {/* Pseudo-element for noise effect - hard to achieve in pure JSX/CSS, so simplified to shadow */}
                          <span className="relative z-10">{msg.message}</span>
                        </motion.div>

                        {/* F1 themed emoji reactions */}
                        <div className="flex gap-2 mt-2">
                          <motion.button
                            className="text-xs px-2 py-1 rounded bg-f1dark/50 hover:bg-f1red/20 transition-colors"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🏁
                          </motion.button>
                          <motion.button
                            className="text-xs px-2 py-1 rounded bg-f1dark/50 hover:bg-f1red/20 transition-colors"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🏆
                          </motion.button>
                          <motion.button
                            className="text-xs px-2 py-1 rounded bg-f1dark/50 hover:bg-f1red/20 transition-colors"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🔥
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Push to Talk Style */}
          <div className="p-4 border-t border-f1red/20 bg-gradient-to-r from-f1dark/50 to-transparent">
            <div className="flex gap-3">
              {/* Push to Talk Button */}
              <motion.button
                className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                  isPushing 
                    ? 'bg-f1red text-f1light shadow-lg scale-95' 
                    : 'glass-light text-f1light/60 hover:bg-f1red/20'
                }`}
                onMouseDown={() => setIsPushing(true)}
                onMouseUp={() => setIsPushing(false)}
                onMouseLeave={() => setIsPushing(false)}
                whileTap={{ scale: 0.98 }}
              >
                <Mic className={`w-5 h-5 ${isPushing ? 'animate-pulse' : ''}`} />
                <span className="font-mono">PTT</span>
              </motion.button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Transmit message..."
                className="flex-1 glass-light text-f1light px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-f1red font-mono placeholder:text-f1light/40"
              />
              
              <motion.button
                onClick={handleSend}
                className="bg-f1red text-f1light px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-f1red/80 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
                <span className="font-mono">SEND</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}