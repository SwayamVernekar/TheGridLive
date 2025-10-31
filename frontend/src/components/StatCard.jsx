import { motion } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'
import { TrendingUp } from 'lucide-react'; // Placeholder for default icon if needed

// Renamed the prop from 'icon' to 'Icon' convention for clarity in JSX
export function StatCard({ icon: Icon, label, value, subtitle, highlight = false }) {
  
  return (
    <motion.div 
      className={`glass-strong rounded-lg p-6 shadow-lg card-hover ${highlight ? 'ring-2 ring-f1red glow-red' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-f1light/60 text-sm mb-1">{label}</div>
        {/* Icon rendering added here */}
        {Icon && <Icon className="w-6 h-6 text-f1red" />}
      </div>
      
      <motion.div 
        className="text-2xl font-bold text-f1light mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {value}
      </motion.div>
      
      <motion.div
        className="text-f1red font-semibold text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {subtitle}
      </motion.div>
    </motion.div>
  );
}