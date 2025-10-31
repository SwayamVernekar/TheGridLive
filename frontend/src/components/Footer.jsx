import { Github, Twitter, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion'; // Using 'framer-motion' as the standard library for 'motion'



export function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-strong border-t border-f1light/10 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="text-2xl font-bold gradient-text mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              TheGridLive
            </motion.div>
            <motion.p 
              className="text-f1light/60 text-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Your real-time source for F1 news, live telemetry, standings, and analysis. 
              Stay connected with the fastest motorsport on earth.
            </motion.p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-f1light font-bold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-f1light/60 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate?.('/about')} 
                  className="hover:text-f1red transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('/contact')} 
                  className="hover:text-f1red transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('/privacy')} 
                  className="hover:text-f1red transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('/terms')} 
                  className="hover:text-f1red transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-f1light font-bold mb-3">Follow Us</h4>
            <div className="flex gap-3">
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-f1dark rounded-lg flex items-center justify-center hover:bg-f1red transition-colors text-f1light"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-f1dark rounded-lg flex items-center justify-center hover:bg-f1red transition-colors text-f1light"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-f1dark rounded-lg flex items-center justify-center hover:bg-f1red transition-colors text-f1light"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                className="w-10 h-10 bg-f1dark rounded-lg flex items-center justify-center hover:bg-f1red transition-colors text-f1light"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <Youtube className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-f1light/10 pt-4 flex justify-between items-center text-sm text-f1light/40">
          <p>&copy; {currentYear} TheGridLive. All rights reserved.</p>
          <p>Powered by Real-time F1 Data</p>
        </div>
      </div>
    </footer>
  );
}