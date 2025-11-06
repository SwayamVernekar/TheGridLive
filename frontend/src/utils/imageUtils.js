/**
 * Utility functions for getting F1 image paths
 * Centralized to ensure consistency across all components
 */

/**
 * Get driver image path
 * @param {string} driverCode - Driver code or surname
 * @returns {string} Path to driver image
 */
export const getDriverImage = (driverCode) => {
  const normalizedCode = driverCode?.toLowerCase().replace(/\s+/g, '_');
  const path = `/images/drivers/driver-${normalizedCode}.png`;
  console.log('[imageUtils] getDriverImage:', driverCode, '->', path);
  return path;
};

/**
 * Get team logo path
 * @param {string} constructorName - Constructor/team name
 * @returns {string} Path to team logo
 */
export const getTeamImage = (constructorName) => {
  // Map alternative team IDs to standardized names
  const teamIdMapping = {
    'red_bull_racing': 'red_bull',
    'redbull': 'red_bull',
    'racing_bulls': 'rb',
    'alphatauri': 'rb',
    'alpha_tauri': 'rb',
    'kick_sauber': 'sauber',
    'alfa_romeo': 'sauber',
    'alfa': 'sauber',
    'haas_f1_team': 'haas',
  };
  
  const normalizedName = constructorName?.toLowerCase().replace(/\s+/g, '_');
  const mappedId = teamIdMapping[normalizedName] || normalizedName;
  return `/images/teams/team-${mappedId}.png`;
};

/**
 * Get circuit image path
 * @param {string} circuitId - Circuit ID or name
 * @returns {string} Path to circuit image
 */
export const getCircuitImage = (circuitId) => {
  // Map circuit IDs to standardized file names
  const circuitMapping = {
    // Original mappings
    'jeddah': 'saudi_arabia',
    'albert_park': 'australia',
    'villeneuve': 'canada',
    'red_bull_ring': 'austria',
    'catalunya': 'spain',
    'hungaroring': 'hungary',
    'spa': 'belgium',
    'zandvoort': 'netherlands',
    'monza': 'italy',
    'baku': 'azerbaijan',
    'marina_bay': 'singapore',
    'americas': 'united_states',
    'rodriguez': 'mexico',
    'interlagos': 'brazil',
    'losail': 'qatar',
    'yas_marina': 'abu_dhabi',
    'imola': 'emilia_romagna',
    'silverstone': 'great_britain',
    'shanghai': 'china',
    'suzuka': 'japan',
    // Additional name variations
    'australian': 'australia',
    'bahraini': 'bahrain',
    'sakhir': 'bahrain',
    'barcelona': 'spain',
    'spanish': 'spain',
    'canadian': 'canada',
    'montreal': 'canada',
    'austrian': 'austria',
    'spielberg': 'austria',
    'belgian': 'belgium',
    'spa-francorchamps': 'belgium',
    'hungarian': 'hungary',
    'budapest': 'hungary',
    'austin': 'united_states',
    'cota': 'united_states',
    'mexican': 'mexico',
    'mexico_city': 'mexico',
    'brazilian': 'brazil',
    'sao_paulo': 'brazil',
    'saudi': 'saudi_arabia',
    'qatari': 'qatar',
    'yas_island': 'abu_dhabi',
    'abu-dhabi': 'abu_dhabi',
  };

  const normalizedId = circuitId?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  const mappedId = circuitMapping[normalizedId] || normalizedId;
  return `/images/circuits/circuit-${mappedId}.png`;
};

/**
 * Get car image path
 * @param {string} constructorId - Constructor ID
 * @param {number} year - Season year
 * @returns {string} Path to car image
 */
export const getCarImage = (constructorId, year = 2025) => {
  // Map alternative team IDs to standardized names
  const teamIdMapping = {
    'red_bull_racing': 'red_bull',
    'redbull': 'red_bull',
    'racing_bulls': 'rb',
    'alphatauri': 'rb',
    'alpha_tauri': 'rb',
    'kick_sauber': 'sauber',
    'alfa_romeo': 'sauber',
    'alfa': 'sauber',
    'haas_f1_team': 'haas',
  };
  
  const normalizedId = constructorId?.toLowerCase().replace(/\s+/g, '_');
  const mappedId = teamIdMapping[normalizedId] || normalizedId;
  return `/images/cars/car-${mappedId}-${year}.png`;
};

/**
 * Get placeholder image path by type
 * @param {string} type - Type of placeholder (driver, team, car, circuit, news)
 * @returns {string} Path to placeholder image
 */
export const getPlaceholderImage = (type = 'general') => {
  const placeholders = {
    driver: '/images/driver-placeholder.png',
    team: '/images/car-placeholder.png',
    car: '/images/car-placeholder.png',
    circuit: '/images/circuit-placeholder.png',
    news: '/images/news-placeholder.png',
    general: '/images/car-placeholder.png'
  };
  
  return placeholders[type] || placeholders.general;
};
