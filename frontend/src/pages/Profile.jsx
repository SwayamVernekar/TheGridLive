import { useState, useEffect } from 'react';
import { User, Save, Edit2, Check, LogOut, LogIn } from 'lucide-react';

export function Profile({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [favoriteDriver, setFavoriteDriver] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('chatUsername') || '';
    const storedEmail = localStorage.getItem('userEmail') || '';
    const storedFavoriteDriver = localStorage.getItem('favoriteDriverName') || '';
    const storedFavoriteTeam = localStorage.getItem('favoriteTeamName') || '';
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';

    setUsername(storedUsername);
    setEmail(storedEmail);
    setFavoriteDriver(storedFavoriteDriver);
    setFavoriteTeam(storedFavoriteTeam);
    setIsAuthenticated(authStatus);

    // If we have an email, try to fetch user data from server
    if (storedEmail) {
      fetchUserProfile(storedEmail);
    }
  }, []);

  const fetchUserProfile = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:5002/api/users/${userEmail}`);
      if (response.ok) {
        const userData = await response.json();
        // Update state with server data if available
        if (userData.username) setUsername(userData.username);
        if (userData.favoriteDriver) setFavoriteDriver(userData.favoriteDriver);
        if (userData.favoriteTeam) setFavoriteTeam(userData.favoriteTeam);
        
        // Also update localStorage
        if (userData.username) localStorage.setItem('chatUsername', userData.username);
        if (userData.favoriteDriver) localStorage.setItem('favoriteDriverName', userData.favoriteDriver);
        if (userData.favoriteTeam) localStorage.setItem('favoriteTeamName', userData.favoriteTeam);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Continue with localStorage data if server fetch fails
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setSaveMessage('Username is required');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Save to localStorage
      localStorage.setItem('chatUsername', username.trim());
      if (email) localStorage.setItem('userEmail', email.trim());
      if (favoriteDriver) localStorage.setItem('favoriteDriverName', favoriteDriver);
      if (favoriteTeam) localStorage.setItem('favoriteTeamName', favoriteTeam);

      // If email is provided, save to backend
      if (email) {
        const response = await fetch('http://localhost:5002/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim(),
            favoriteDriver,
            favoriteTeam,
            preferences: {
              notifications: true,
              theme: 'dark',
              language: 'en'
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save to server');
        }
      }

      setIsEditing(false);
      setSaveMessage('Profile saved successfully! ✓');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Saved locally (server unavailable)');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('favoriteDriver');
    
    // Optionally clear profile data (uncomment if you want to clear everything on logout)
    // localStorage.removeItem('chatUsername');
    // localStorage.removeItem('userEmail');
    // localStorage.removeItem('favoriteDriverName');
    // localStorage.removeItem('favoriteTeamName');
    
    setIsAuthenticated(false);
    
    // Navigate to login page
    if (typeof onNavigate === 'function') {
      onNavigate('/login');
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/login';
    }
  };

  const handleLogin = () => {
    // Navigate to login page
    if (typeof onNavigate === 'function') {
      onNavigate('/login');
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/login';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <User className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
          </div>
          <p className="text-foreground/60 text-lg">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card/50 backdrop-blur-lg rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/20 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Check className="w-4 h-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </>
                  )}
                </button>
                
                {/* Logout/Login Button */}
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2"
                    title="Login"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-background border border-primary/20 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                maxLength={30}
              />
              <p className="text-xs text-foreground/50 mt-1">
                This name will appear in the live chat
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email <span className="text-foreground/50">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-background border border-primary/20 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-foreground/50 mt-1">
                Sync your profile across devices (stored on server)
              </p>
            </div>

            {/* Favorite Driver */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Favorite Driver <span className="text-foreground/50">(Optional)</span>
              </label>
              <input
                type="text"
                value={favoriteDriver}
                onChange={(e) => setFavoriteDriver(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Max Verstappen"
                className="w-full px-4 py-3 bg-background border border-primary/20 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Favorite Team */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Favorite Team <span className="text-foreground/50">(Optional)</span>
              </label>
              <input
                type="text"
                value={favoriteTeam}
                onChange={(e) => setFavoriteTeam(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Red Bull Racing"
                className="w-full px-4 py-3 bg-background border border-primary/20 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !username.trim()}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Save Message */}
            {saveMessage && (
              <div className={`text-center py-2 px-4 rounded-lg ${
                saveMessage.includes('successfully') 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>

        {/* Profile Stats Card */}
        <div className="mt-6 bg-card/50 backdrop-blur-lg rounded-2xl border border-primary/20 shadow-2xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Profile Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-xl border border-primary/10">
              <p className="text-sm text-foreground/60 mb-1">Username</p>
              <p className="text-lg font-bold text-foreground">
                {username || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-xl border border-primary/10">
              <p className="text-sm text-foreground/60 mb-1">Favorite Driver</p>
              <p className="text-lg font-bold text-foreground">
                {favoriteDriver || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-xl border border-primary/10">
              <p className="text-sm text-foreground/60 mb-1">Favorite Team</p>
              <p className="text-lg font-bold text-foreground">
                {favoriteTeam || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-xl border border-primary/10">
              <p className="text-sm text-foreground/60 mb-1">Account Status</p>
              <p className={`text-lg font-bold ${isAuthenticated ? 'text-green-400' : 'text-yellow-400'}`}>
                {isAuthenticated ? 'Logged In' : 'Not Logged In'}
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-sm text-foreground/70 text-center">
            🏎️ Your username is required for using the live chat feature. Other fields are optional.
          </p>
        </div>
      </div>
    </div>
  );
}
