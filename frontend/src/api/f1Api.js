/**
 * F1 API Helper Functions - REVAMPED
 * Centralized API calls to the Node.js backend (Ergast + News API integration)
 * Includes caching to prevent rate limiting
 */

import apiCache from '../lib/cache.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

/**
 * Fetch driver standings from Ergast via backend
 * @param {number} year - Optional year parameter (defaults to current year)
 * @returns {Promise<Object>} Object with standings array and metadata
 */
export async function fetchDriverStandings(year) {
  // Check cache first
  const cached = apiCache.get('fetchDriverStandings', year);
  if (cached) {
    console.log('🔄 Using cached driver standings data');
    return cached;
  }

  console.log('\n🏎️ ========== FETCH DRIVER STANDINGS ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Year parameter:', year || 'not specified (will use current year)');

  try {
    const url = year
      ? `${API_BASE_URL}/api/data/standings/drivers?year=${year}`
      : `${API_BASE_URL}/api/data/standings/drivers`;

    console.log('API Base URL:', API_BASE_URL);
    console.log('Full request URL:', url);
    console.log('Sending fetch request...');

    const response = await fetch(url);

    console.log('✓ Response received');
    console.log('Response status:', response.status, response.statusText);
    console.log('Response OK:', response.ok);
    console.log('Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });

    if (!response.ok) {
      console.error('❌ Response not OK!');
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Parsing JSON response...');
    const data = await response.json();

    console.log('✓ JSON parsed successfully');
    console.log('Response data structure:', Object.keys(data));
    console.log('Standings array exists:', Array.isArray(data.standings) ? 'YES' : 'NO');
    console.log('Standings count:', data.standings?.length || 0);
    console.log('Year in response:', data.year);
    console.log('Last update:', data.lastUpdate);

    if (data.standings && data.standings.length > 0) {
      console.log('Sample driver (first):', JSON.stringify(data.standings[0], null, 2));
    }

    if (data.error) {
      console.warn('⚠️ Response contains error:', data.error);
    }

    // Cache the successful response
    apiCache.set('fetchDriverStandings', data, year);

    console.log('Returning data to component');
    console.log('========== FETCH DRIVER STANDINGS COMPLETE ==========\n');
    return data;
  } catch (error) {
    console.error('\n❌ ========== FETCH DRIVER STANDINGS ERROR ==========');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('API Driver Standings Fetch Error:', error);
    console.error('========== ERROR END ==========\n');
    return { standings: [], year: year || new Date().getFullYear(), error: error.message };
  }
}

/**
 * Fetch constructor standings from Ergast via backend
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with standings array and metadata
 */
export async function fetchConstructorStandings(year) {
  // Check cache first
  const cached = apiCache.get('fetchConstructorStandings', year);
  if (cached) {
    console.log('🔄 Using cached constructor standings data');
    return cached;
  }

  try {
    const url = year
      ? `${API_BASE_URL}/api/data/standings/constructors?year=${year}`
      : `${API_BASE_URL}/api/data/standings/constructors`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set('fetchConstructorStandings', data, year);

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
  // Check cache first
  const cached = apiCache.get('fetchDrivers', year);
  if (cached) {
    console.log('🔄 Using cached drivers data');
    return cached;
  }

  try {
    const url = year
      ? `${API_BASE_URL}/api/data/drivers?year=${year}`
      : `${API_BASE_URL}/api/data/drivers`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set('fetchDrivers', data, year);

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
  // Check cache first
  const cached = apiCache.get('fetchTeams', year);
  if (cached) {
    console.log('🔄 Using cached teams data');
    return cached;
  }

  try {
    const url = year
      ? `${API_BASE_URL}/api/data/teams?year=${year}`
      : `${API_BASE_URL}/api/data/teams`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set('fetchTeams', data, year);

    return data;
  } catch (error) {
    console.error('API Teams Fetch Error:', error);
    return { teams: [], year: year || new Date().getFullYear(), count: 0, error: error.message };
  }
}

/**
 * Fetch details for a single team/constructor
 * @param {string} teamId - Team/constructor ID
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with team details
 */
export async function fetchTeamDetails(teamId, year) {
  // Check cache first
  const cached = apiCache.get('fetchTeamDetails', teamId, year);
  if (cached) {
    console.log('🔄 Using cached team details data');
    return cached;
  }

  try {
    const url = year
      ? `${API_BASE_URL}/api/data/teams/${teamId}?year=${year}`
      : `${API_BASE_URL}/api/data/teams/${teamId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set('fetchTeamDetails', data, teamId, year);

    return data;
  } catch (error) {
    console.error('API Team Details Fetch Error:', error);
    return { team: null, error: error.message };
  }
}

/**
 * Fetch race schedule from Ergast via backend
 * @param {number} year - Optional year parameter
 * @returns {Promise<Object>} Object with races array, next race, and metadata
 */
export async function fetchSchedule(year) {
  // Check cache first
  const cached = apiCache.get('fetchSchedule', year);
  if (cached) {
    console.log('🔄 Using cached schedule data');
    return cached;
  }

  try {
    const url = year
      ? `${API_BASE_URL}/api/data/schedule?year=${year}`
      : `${API_BASE_URL}/api/data/schedule`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set('fetchSchedule', data, year);

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
  // Check cache first
  const cached = apiCache.get('fetchRaceResults', year, round);
  if (cached) {
    console.log('🔄 Using cached race results data');
    return cached;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/data/race-results/${year}/${round}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the successful response
    apiCache.set('fetchRaceResults', data, year, round);

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
  fetchTeamDetails,
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
