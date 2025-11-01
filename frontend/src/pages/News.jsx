import { useState, useEffect } from 'react';
import { Calendar, Tag, ExternalLink, AlertCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchNews } from '../api/f1Api';

const ImageWithFallback = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

export function News() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchNews();

        if (response.error) {
          throw new Error(response.error);
        }

        setNewsArticles(response.articles || []);
        setFilteredArticles(response.articles || []);
      } catch (err) {
        console.error('Failed to load news:', err);
        setError('Failed to load news articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  // Filter and sort articles
  useEffect(() => {
    let filtered = [...newsArticles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(article => {
        const title = article.title?.toLowerCase() || '';
        const description = article.description?.toLowerCase() || '';
        const content = title + ' ' + description;

        switch (selectedCategory) {
          case 'Technical':
            return content.includes('technical') || content.includes('engine') || content.includes('aerodynamics') || content.includes('tires') || content.includes('brake');
          case 'Driver Market':
            return content.includes('transfer') || content.includes('contract') || content.includes('driver market') || content.includes('signing') || content.includes('leaving');
          case 'Race Reports':
            return content.includes('race') || content.includes('grand prix') || content.includes('qualifying') || content.includes('podium') || content.includes('win');
          case 'Championship':
            return content.includes('championship') || content.includes('points') || content.includes('leader') || content.includes('standings') || content.includes('title');
          case 'Teams':
            return content.includes('team') || content.includes('constructor') || content.includes('factory') || content.includes('paddock');
          case 'Regulations':
            return content.includes('regulation') || content.includes('rule') || content.includes('ban') || content.includes('change') || content.includes('fia');
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishedAt || 0) - new Date(b.publishedAt || 0);
        case 'newest':
        default:
          return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      }
    });

    setFilteredArticles(filtered);
  }, [newsArticles, searchTerm, selectedCategory, sortBy]);

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
          <AlertCircle className="w-16 h-16 text-f1red mx-auto mb-4" />
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
    <div className="p-4 md:p-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-f1light mb-2 flex items-center gap-3">
          <Tag className="w-8 h-8 text-f1red" />
          Latest F1 News
        </h1>
        <p className="text-f1light/60">Stay updated with the latest news from the world of Formula 1.</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-f1light/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-f1dark text-f1light rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-f1dark text-f1light rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            >
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Driver Market">Driver Market</option>
              <option value="Race Reports">Race Reports</option>
              <option value="Championship">Championship</option>
              <option value="Teams">Teams</option>
              <option value="Regulations">Regulations</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-f1dark text-f1light rounded-lg border border-f1light/20 focus:outline-none focus:ring-2 focus:ring-f1red"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="text-f1light/60 text-sm mt-2">
          Showing {filteredArticles.length} of {newsArticles.length} articles
        </div>
      </div>

      {filteredArticles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-f1light/30 mx-auto mb-4" />
          <p className="text-f1light/60 text-lg">No news articles available at the moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.url || index}
            className="glass-strong rounded-xl overflow-hidden shadow-2xl transition-all duration-300 cursor-pointer group"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(220, 0, 0, 0.4)' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => article.url && window.open(article.url, '_blank')}
          >
            <div className="aspect-video w-full bg-gray-800 overflow-hidden relative">
              <ImageWithFallback
                src={article.urlToImage || `https://source.unsplash.com/800x450/?f1,racing,formula1`}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-1 text-f1red font-bold text-xs uppercase tracking-wider">
                  <Tag className="w-4 h-4" />
                  <span>{article.source?.name || 'F1 News'}</span>
                </div>
                {article.publishedAt && (
                  <div className="flex items-center gap-1 text-f1light/50 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-extrabold text-f1light mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-f1light/70 line-clamp-3 mb-4 text-sm">{article.description || 'Click to read the full article.'}</p>
              <div className="text-f1red font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Read More <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}