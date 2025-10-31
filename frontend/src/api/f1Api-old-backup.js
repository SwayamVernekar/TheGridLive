/**
 * F1 API Helper Functions
 * Centralized API calls to the Node.js backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

/**
 * Fetch comprehensive stats (mock data for historical pages)
 * @returns {Promise<Object>} Object containing drivers, teams, news, legendaryDrivers
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
      drivers: [],
      teams: [],
      news: [],
      legendaryDrivers: []
    };
  }
}

/**
 * Fetch driver standings from the backend
 * @param {number} year - Optional year parameter (defaults to current year)
 * @returns {Promise<Array>} Array of driver standings
 */
export async function fetchDriverStandings(year) {
  try {
    const url = year 
      ? `${API_BASE_URL}/api/data/standings?year=${year}`
      : `${API_BASE_URL}/api/data/standings`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.standings || data; // Handle both wrapped and unwrapped responses
  } catch (error) {
    console.error('API Standings Fetch Error:', error);
    // Return empty array on error - components will handle this
    return [];
  }
}

/**
 * Fetch constructor standings from the backend
 * @param {number} year - Optional year parameter
 * @returns {Promise<Array>} Array of constructor standings
 */
export async function fetchConstructorStandings(year) {
  try {
    const url = year
      ? `${API_BASE_URL}/api/data/constructor-standings?year=${year}`
      : `${API_BASE_URL}/api/data/constructor-standings`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.standings || data;
  } catch (error) {
    console.error('API Constructor Standings Fetch Error:', error);
    return [];
  }
}

/**
 * Fetch list of all drivers
 * @param {number} year - Optional year parameter
 * @returns {Promise<Array>} Array of drivers
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
    return data.drivers || data;
  } catch (error) {
    console.error('API Drivers Fetch Error:', error);
    return [];
  }
}

/**
 * Fetch telemetry data for a specific driver
 * @param {string} driverAbbr - Driver abbreviation (e.g., 'VER', 'HAM')
 * @param {Object} options - Optional parameters (year, event, session)
 * @returns {Promise<Object>} Telemetry data object
 */
export async function fetchTelemetry(driverAbbr, options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.year) params.append('year', options.year);
    if (options.event) params.append('event', options.event);
    if (options.session) params.append('session', options.session);
    
    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/api/data/telemetry/${driverAbbr}?${queryString}`
      : `${API_BASE_URL}/api/data/telemetry/${driverAbbr}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Telemetry Fetch Error:', error);
    return { telemetry: [] };
  }
}

/**
 * Fetch race schedule
 * @param {number} year - Optional year parameter
 * @returns {Promise<Array>} Array of race events
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
    return data.events || data;
  } catch (error) {
    console.error('API Schedule Fetch Error:', error);
    return [];
  }
}

/**
 * Fetch race results for a specific event
 * @param {number} year - Year of the race
 * @param {string|number} event - Event name or round number
 * @returns {Promise<Array>} Array of race results
 */
export async function fetchRaceResults(year, event) {
  try {
    const url = `${API_BASE_URL}/api/data/race-results/${year}/${event}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('API Race Results Fetch Error:', error);
    return [];
  }
}

/**
 * Check backend and Python service health
 * @returns {Promise<Object>} Health status object
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Health Check Error:', error);
    return {
      backend: 'unavailable',
      pythonService: 'unknown',
      error: error.message
    };
  }
}

/**
 * Fetch user profile
 * @param {string} email - User email
 * @returns {Promise<Object>} User profile object
 */
export async function fetchUserProfile(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/${email}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API User Profile Fetch Error:', error);
    return null;
  }
}

/**
 * Create or update user profile
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Updated user object
 */
export async function saveUserProfile(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API User Profile Save Error:', error);
    throw error;
  }
}

/**
 * Update favorite driver
 * @param {string} email - User email
 * @param {string} favoriteDriver - Driver abbreviation or ID
 * @returns {Promise<Object>} Updated user object
 */
export async function updateFavoriteDriver(email, favoriteDriver) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/${email}/favorite-driver`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ favoriteDriver }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Favorite Driver Update Error:', error);
    throw error;
  }
}

// Export all functions as a single object as well for convenience
export default {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchDrivers,
  fetchTelemetry,
  fetchSchedule,
  fetchRaceResults,
  checkHealth,
  fetchUserProfile,
  saveUserProfile,
  updateFavoriteDriver,
};
