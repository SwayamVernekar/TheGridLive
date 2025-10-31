import { useState, useEffect } from 'react';
import { Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchStats } from '../api/f1Api';

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

export function News() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStats();
        setNewsArticles(data.news || []);
      } catch (err) {
        console.error('Failed to load news:', err);
        setError('Failed to load news articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  const imageCategories = {
    Championship: 'f1,trophy,podium,celebration',
    Regulations: 'f1,technical,garage',
    Transfers: 'f1,portrait,team',
    Teams: 'f1,paddock,pitlane',
    Technology: 'f1,aerodynamics,modern',
    Events: 'f1,circuit,fans',
    Safety: 'f1,cockpit,driver',
    Drivers: 'f1driver,portrait',
    Race: 'f1,racing,action',
    Technical: 'f1,garage,mechanics',
    Driver: 'f1,driver,helmet',
    Team: 'f1,team,pitlane',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-f1red mb-4"></div>
          <p className="text-f1light text-xl">Loading latest news...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-strong rounded-xl p-8 text-center max-w-md"
        >
          <Tag className="w-16 h-16 text-f1red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-f1light mb-2">Unable to Load News</h2>
          <p className="text-f1light/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-f1red text-white rounded-lg hover:bg-f1red/80 transition-colors"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Latest F1 News 📰</h1>
        <p className="text-gray-400">Stay updated with the latest news from the world of Formula 1.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsArticles.map((article, index) => (
          <motion.div
            key={article.id}
            // Using modern dark theme classes and framer-motion for effect
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(220, 0, 0, 0.4)' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="aspect-video w-full bg-gray-800 overflow-hidden">
              <ImageWithFallback
                src={`https://source.unsplash.com/800x450/?${imageCategories[article.category] || 'formula1,racing'}`}
                alt={article.title}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase tracking-wider">
                  <Tag className="w-4 h-4" />
                  <span>{article.category}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Oct 3, 2025</span>
                </div>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-400 line-clamp-3 mb-4">{article.description}</p>
              <button className="text-red-600 font-semibold flex items-center gap-1 hover:text-red-400 transition-colors">
                Read More →
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}