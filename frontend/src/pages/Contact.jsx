import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send, Clock } from 'lucide-react';
import { useState } from 'react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-f1light">Contact Us</h1>
          <p className="text-f1light/70 mt-4 max-w-3xl">
            Have feedback, questions, or just want to say hi? We'd love to hear from you. Our team is here to help make your TheGridLive experience exceptional.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <motion.div
          className="lg:col-span-2 glass-strong rounded-xl p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-f1light/80 mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                  placeholder="Lewis Hamilton"
                  required
                />
              </div>
              <div>
                <label className="block text-f1light/80 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                  placeholder="lewis@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-f1light/80 mb-2">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors"
                placeholder="Question about features"
                required
              />
            </div>

            <div>
              <label className="block text-f1light/80 mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-black/40 border-2 border-f1light/20 rounded-lg text-f1light placeholder-f1light/40 focus:border-f1red focus:outline-none transition-colors resize-none"
                placeholder="Tell us what's on your mind..."
                required
              />
            </div>

            <motion.button
              type="submit"
              className="gradient-primary px-8 py-4 rounded-lg text-f1light font-bold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
              Send Message
            </motion.button>

            {submitted && (
              <p className="text-green-500 font-semibold mt-2">Message sent successfully!</p>
            )}
          </form>
        </motion.div>

        {/* Contact Info */}
        <div className="space-y-6">
          <motion.div
            className="glass-strong rounded-xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-bold text-f1light mb-1">Email</p>
            <p className="text-f1light/70 text-sm">support@thegridlive.com</p>
          </motion.div>

          <motion.div
            className="glass-strong rounded-xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="font-bold text-f1light mb-1">Phone</p>
            <p className="text-f1light/70 text-sm">+1 234 567 890</p>
          </motion.div>

          <motion.div
            className="glass-strong rounded-xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="font-bold text-f1light mb-1">Address</p>
            <p className="text-f1light/70 text-sm">123 F1 Grid Lane, London, UK</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
