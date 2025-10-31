import { motion } from 'framer-motion';
import { Flag, Users, Zap, Globe, Heart, Trophy } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Real-time Analytics',
      description: 'Live lap times, telemetry, and strategic insights',
    },
    {
      icon: <Globe className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Global Coverage',
      description: 'Follow every race, every circuit, across the world',
    },
    {
      icon: <Trophy className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Predict & Win',
      description: 'Predict podiums and earn achievements',
    },
    {
      icon: <Heart className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Community Engagement',
      description: 'Connect with other F1 fans and share insights',
    },
  ];

  const teamValues = [
    {
      title: 'Performance',
      description: 'Our platform is optimized for lightning-fast performance.',
    },
    {
      title: 'Innovation',
      description: 'We constantly innovate to deliver the best fan experience.',
    },
    {
      title: 'Community First',
      description: 'Building a community where every fan feels included.',
    },
    {
      title: 'Authenticity',
      description: 'Celebrating the history of F1 while embracing its future.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-f1light">About TheGridLive</h1>
        <p className="text-f1light/70 mt-4 max-w-3xl">
          TheGridLive brings F1 fans closer to the action with live telemetry, immersive analytics, and a passionate community.
        </p>
      </motion.div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          className="glass-strong rounded-xl p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-f1light mb-3">Our Mission</h2>
          <p>
            Deliver real-time race data and an immersive platform capturing the raw adrenaline of F1.
          </p>
        </motion.div>

        <motion.div
          className="glass-strong rounded-xl p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-f1light mb-3">Our Vision</h2>
          <p>
            Where data meets passion: a community where every fan can engage with F1 at unprecedented levels.
          </p>
        </motion.div>
      </div>

      {/* What We Offer */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="glass-light rounded-lg p-6 hover:scale-105 transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {feature.icon}
            <h3 className="text-xl font-bold text-f1light mt-3">{feature.title}</h3>
            <p className="text-f1light/70 mt-1">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Our Story */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-f1light mb-3">Our Story</h2>
        <p>
          We set out to build a platform that transforms how fans experience F1. Our team of developers, data scientists, and enthusiasts ensures every feature, visualization, and interaction reflects the speed and excitement of the sport.
        </p>
        <p>
          From the cockpit visuals to glassmorphism effects, every design choice is intentional. TheGridLive is your home for telemetry, predictions, and championship thrills.
        </p>
      </motion.div>

      {/* Team Values */}
      <div className="grid md:grid-cols-2 gap-6">
        {teamValues.map((value, index) => (
          <motion.div
            key={index}
            className="glass-light rounded-lg p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <h3 className="text-xl font-bold text-f1light">{value.title}</h3>
            <p className="text-f1light/70 mt-1">{value.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-f1light mb-3">Join Our Community</h2>
        <p className="text-f1light/70">
          Engage with F1 fans worldwide and get the most out of your Formula 1 experience.
        </p>
      </motion.div>
    </div>
  );
}
