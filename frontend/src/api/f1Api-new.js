/**
 * F1 API Helper Functions - REVAMPED
 * Centralized API calls to the Node.js backend (Ergast + News API integration)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

/**
 * Fetch driver standings from Ergast via backend
 * @param {number} year - Optional year parameter (defaults to current year)
 * @returns {Promise<Object>} Object with standings array and metadata
 */
export async function fetchDriverStandings(year) {
  try {
    const url = year 
      ? `${API_BASE_URL}/api/data/standings/drivers?year=${year}`
      : `${API_BASE_URL}/api/data/standings/drivers`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Driver Standings Fetch Error:', error);
    return { standings: [], year: year || new Date().getFullYear(), error: error.message };
  }
}

/**
 * Fetch constructor standings from Ergast via backend
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with standings array and metadata
 */
export async function fetchConstructorStandings(year) {
  try {
    const url = year
      ? `${API_BASE_URL}/api/data/standings/constructors?year=${year}`
      : `${API_BASE_URL}/api/data/standings/constructors`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Constructor Standings Fetch Error:', error);
    return { standings: [], year: year || new Date().getFullYear(), error: error.message };
  }
}

/**
 * Fetch complete list of all drivers for the season from Ergast
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with drivers array and metadata
 */
export async function fetchDrivers(year) {
  try {
    const url = year
      ? `${API_BASE_URL}/api/data/drivers?year=${year}`
      : `${API_BASE_URL}/api/data/drivers`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Drivers Fetch Error:', error);
    return { drivers: [], year: year || new Date().getFullYear(), count: 0, error: error.message };
  }
}

/**
 * Fetch complete list of all teams/constructors for the season from Ergast
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with teams array and metadata
 */
export async function fetchTeams(year) {
  try {
    const url = year
      ? `${API_BASE_URL}/api/data/teams?year=${year}`
      : `${API_BASE_URL}/api/data/teams`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Teams Fetch Error:', error);
    return { teams: [], year: year || new Date().getFullYear(), count: 0, error: error.message };
  }
}

/**
 * Fetch race schedule from Ergast via backend
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with races array, next race, and metadata
 */
export async function fetchSchedule(year) {
  try {
    const url = year
      ? `${API_BASE_URL}/api/data/schedule?year=${year}`
      : `${API_BASE_URL}/api/data/schedule`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Schedule Fetch Error:', error);
    return { races: [], nextRace: null, year: year || new Date().getFullYear(), error: error.message };
  }
}

/**
 * Fetch race results from Ergast via backend
 * @param {number} year - Race year
 * @param {number} round - Race round number
 * @returns {Promise<Object>} Object with race results and metadata
 */
export async function fetchRaceResults(year, round) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data/race-results/${year}/${round}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Race Results Fetch Error:', error);
    return { results: [], error: error.message };
  }
}

/**
 * Fetch F1 news articles from News API via backend
 * @returns {Promise<Object>} Object with news articles array and metadata
 */
export async function fetchNews() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data/news`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API News Fetch Error:', error);
    return { articles: [], count: 0, error: error.message };
  }
}

/**
 * Fetch stats (legendary drivers for F1 Rewind)
 * @returns {Promise<Object>} Object containing legendaryDrivers and other historical data
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/data/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Stats Fetch Error:', error);
    return {
      legendaryDrivers: [],
      error: error.message
    };
  }
}

/**
 * Fetch telemetry data for a specific driver (requires Python FastF1 service)
 * @param {string} driverCode - Driver code (e.g., 'VER', 'HAM')
 * @param {Object} options - Optional parameters (year, event, session)
 * @returns {Promise<Object>} Telemetry data object
 */
export async function fetchTelemetry(driverCode, options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.year) params.append('year', options.year);
    if (options.event) params.append('event', options.event);
    if (options.session) params.append('session', options.session);
    
    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/api/data/telemetry/${driverCode}?${queryString}`
      : `${API_BASE_URL}/api/data/telemetry/${driverCode}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Telemetry Fetch Error:', error);
    return { error: error.message, message: 'Telemetry requires Python FastF1 service' };
  }
}

/**
 * Check backend health status
 * @returns {Promise<Object>} Health status object
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Health Check Error:', error);
    return { status: 'unhealthy', backend: 'unreachable', error: error.message };
  }
}

/**
 * Fetch user profile
 * @param {string} email - User email
 * @returns {Promise<Object>} User profile object
 */
export async function fetchUserProfile(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile/${email}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API User Profile Fetch Error:', error);
    return null;
  }
}

/**
 * Save/update user profile
 * @param {Object} profileData - User profile data
 * @returns {Promise<Object>} Updated user profile
 */
export async function saveUserProfile(profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API User Profile Save Error:', error);
    throw error;
  }
}

/**
 * Update favorite driver
 * @param {string} email - User email
 * @param {string} driverId - Driver ID
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateFavoriteDriver(email, driverId) {
  return saveUserProfile({ email, favoriteDriver: driverId });
}

/**
 * Update favorite team
 * @param {string} email - User email
 * @param {string} teamId - Team/constructor ID
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateFavoriteTeam(email, teamId) {
  return saveUserProfile({ email, favoriteTeam: teamId });
}

// Export all functions as default object as well
export default {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchDrivers,
  fetchTeams,
  fetchSchedule,
  fetchRaceResults,
  fetchNews,
  fetchStats,
  fetchTelemetry,
  checkHealth,
  fetchUserProfile,
  saveUserProfile,
  updateFavoriteDriver,
  updateFavoriteTeam
};
