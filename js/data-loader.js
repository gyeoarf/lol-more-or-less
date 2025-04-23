// data-loader.js - Comprehensive Data Management for LoL More or Less

// Configuration Constants
const APP_VERSION = '1.0.0'; // Update when data structure changes
const GAME_VERSION = '15.8.1'; // League patch version
const CACHE_KEY = `lol-champions-${APP_VERSION}-${GAME_VERSION}`;
const CACHE_EXPIRY_DAYS = 7;
const MAX_RETRIES = 3;

/**
 * Fetches champion data with caching and error handling
 * @returns {Promise<Object>} Champion data object
 */
async function fetchChampionData() {
    try {
        const response = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${GAME_VERSION}/data/en_US/champion.json`
        );
        const { data } = await response.json();

        // Transform data structure
        const championsData = {};
        for (const champKey in data) {
            championsData[data[champKey].name] = data[champKey].stats;
        }

        return championsData;
    } catch (error) {
        console.error("Fetch failed, trying cache...", error);
        throw error; // Will be handled by the service worker
    }
}
/**
 * Gets the official image URL for a champion
 * @param {string} championName
 * @returns {string} Image URL
 */
function getChampionImageUrl(championName) {
    const formattedName = championName.replace(/\s+/g, '');
    return `https://ddragon.leagueoflegends.com/cdn/${GAME_VERSION}/img/champion/${formattedName}.png`;
}

/**
 * Preloads champion images to improve user experience
 * @param {string[]} championNames
 * @returns {Promise<void>}
 */
async function preloadChampionImages(championNames) {
    const preloads = championNames.map(name => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = getChampionImageUrl(name);
            img.onload = resolve;
            img.onerror = resolve; // Don't fail the whole preload if one fails
        });
    });

    await Promise.all(preloads);
}

/**
 * Clears the cached champion data
 */
function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    console.log('Champion data cache cleared');
}

/**
 * Checks if cached data exists and is valid
 * @returns {boolean}
 */
function hasValidCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    try {
        const { timestamp, version } = JSON.parse(cached);
        return version === APP_VERSION &&
            Date.now() - timestamp < CACHE_EXPIRY_DAYS * 86400000;
    } catch {
        return false;
    }
}

export {
    fetchChampionData,
    getChampionImageUrl,
    preloadChampionImages
};