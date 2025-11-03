import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'
// Assuming Logo component is imported from './Logo'
// import { Logo } from './Logo';

// Mock Logo component for self-containment
const Logo = ({ className = '', showText = true }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-8 h-8 bg-f1red rounded-full flex items-center justify-center">
            <span className="text-white font-extrabold">G</span>
        </div>
        {showText && <span className="text-xl font-extrabold text-f1light">TheGridLive</span>}
    </div>
);


export function Navbar({ activeLink, onNavigate, theme, onThemeToggle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Live', path: '/live' },
    { name: 'Drivers', path: '/drivers' },
    { name: 'Teams', path: '/teams' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'F1 Rewind', path: '/rewind' },
    { name: 'Podium Predictor', path: '/predictor' },
    { name: 'Standings', path: '/standings' },
    { name: 'News', path: '/news' },
  ];

  const handleLinkClick = (path) => {
    if (typeof onNavigate === 'function') {
        onNavigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav 
        className={`sticky top-0 z-50 h-16 px-6 flex items-center justify-between shadow-lg backdrop-blur-xl transition-all duration-300 ${
          scrolled ? 'glass-strong' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Logo className="flex-shrink-0" />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <motion.button
              key={link.path}
              onClick={() => handleLinkClick(link.path)}
              className={`relative hover:text-f1red transition-colors font-semibold ${
                activeLink === link.path ? 'text-f1red' : 'text-f1light'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.name}
              {activeLink === link.path && (
                <>
                  {/* DRS Flap Indicator */}
                  <motion.div 
                    className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-16"
                    layoutId="navbar-indicator"
                  >
                    {/* Main flap */}
                    <motion.div
                      className="h-1 bg-gradient-to-r from-transparent via-f1red to-transparent rounded-full glow-red"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Wing elements */}
                    <div className="flex justify-between mt-0.5">
                      <motion.div
                        className="w-2 h-0.5 bg-f1red/60 rounded"
                        initial={{ x: -5, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                      <motion.div
                        className="w-2 h-0.5 bg-f1red/60 rounded"
                        initial={{ x: 5, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </motion.button>
          ))}
        </div>

        {/* Theme Toggle & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-f1dark hover:bg-f1red transition-colors text-f1light"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sun className="w-5 h-5" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Moon className="w-5 h-5" />
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-f1dark hover:bg-f1red transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-f1light" />
            ) : (
              <Menu className="w-5 h-5 text-f1light" />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8"
            style={{ top: '4rem' }}
          >
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`text-2xl font-extrabold ${
                  activeLink === link.path ? 'text-f1red' : 'text-f1light'
                } hover:text-f1red`}
              >
                {link.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}