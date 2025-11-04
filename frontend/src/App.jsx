import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingParticles } from './components/FloatingParticles';
import { SpeedLinesBackground } from './components/SpeedLinesBackground';
import LoadingScreen from './components/LoadingScreen';
import { FavoriteDriverModal } from './components/FavoriteDriverModal';
import { Home } from './pages/Home';
import { Drivers } from './pages/Drivers';
import { Teams } from './pages/Teams';
import { Social } from './pages/Social';
import { HeadToHead } from './pages/HeadToHead';
import { Consistency } from './pages/Consistency';
import { RacePace } from './pages/RacePace';
import { News } from './pages/News';
import { Live } from './pages/Live';
import { DriverStandings } from './pages/DriverStandings';
import { ConstructorStandings } from './pages/ConstructorStandings';
import { DriverDetails } from './pages/DriverDetails';
import { TeamDetails } from './pages/TeamDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Schedule } from './pages/Schedule';

export default function App() {
  const [currentPage, setCurrentPage] = useState('/');
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteDriver, setFavoriteDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      const savedDriver = localStorage.getItem('favoriteDriver');
      if (savedDriver) {
        setFavoriteDriver(JSON.parse(savedDriver));
      } else {
        setTimeout(() => setShowDriverModal(true), 500);
      }
    } else {
      setCurrentPage('/login');
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleFavoriteDriverSelect = (driver) => {
    setFavoriteDriver(driver);
    localStorage.setItem('favoriteDriver', JSON.stringify(driver));
    setShowDriverModal(false);
  };

  const renderPage = () => {
    if (currentPage === '/login') {
      return <Login onNavigate={setCurrentPage} onLogin={handleLogin} />;
    }

    if (currentPage === '/register') {
      return <Register onNavigate={setCurrentPage} onRegister={handleRegister} />;
    }

    if (!isAuthenticated) {
      return <Login onNavigate={setCurrentPage} onLogin={handleLogin} />;
    }

    if (currentPage.startsWith('/driver/')) {
      const driverId = parseInt(currentPage.split('/driver/')[1]);
      return <DriverDetails driverId={driverId} onNavigate={setCurrentPage} />;
    }

    if (currentPage.startsWith('/team/')) {
      const teamId = parseInt(currentPage.split('/team/')[1]);
      return <TeamDetails teamId={teamId} onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case '/':
        return <Home onNavigate={setCurrentPage} favoriteDriver={favoriteDriver} />;
      case '/live':
        return <Live />;
      case '/driver-standings':
        return <DriverStandings />;
      case '/constructor-standings':
        return <ConstructorStandings />;
      case '/drivers':
        return <Drivers onNavigate={setCurrentPage} />;
      case '/teams':
        return <Teams onNavigate={setCurrentPage} />;
      case '/news':
        return <News />;
      case '/social':
        return <Social />;
      case '/head-to-head':
        return <HeadToHead />;
      case '/consistency':
        return <Consistency />;
      case '/race-pace':
        return <RacePace />;

      case '/about':
        return <About />;
      case '/contact':
        return <Contact />;
      case '/privacy':
        return <Privacy />;
      case '/terms':
        return <Terms />;
      case '/schedule':
        return <Schedule onNavigate={setCurrentPage} />;
      default:
        return (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Page Under Construction
            </h1>
            <p className="text-foreground/60">This page is coming soon!</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (currentPage === '/login' || currentPage === '/register') {
    return renderPage();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      <SpeedLinesBackground />
      <FloatingParticles />
      <div className="relative z-10">
        <Navbar
          activeLink={currentPage}
          onNavigate={setCurrentPage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full fade-in">
          {renderPage()}
        </main>
        <Footer onNavigate={setCurrentPage} />
      </div>

      <FavoriteDriverModal
        isOpen={showDriverModal}
        onSelect={handleFavoriteDriverSelect}
      />
    </div>
  );
}
