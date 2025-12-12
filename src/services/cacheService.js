import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'flickr_images_cache';
const CACHE_HASH_KEY = 'flickr_images_hash';

/**
 * Generate a simple hash from the API response to detect changes
 */
const generateHash = (data) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

/**
 * Save images to cache with hash for change detection
 */
export const cacheImages = async (images) => {
  try {
    const hash = generateHash(images);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(images));
    await AsyncStorage.setItem(CACHE_HASH_KEY, hash);
    console.log('Images cached successfully');
  } catch (error) {
    console.error('Error caching images:', error);
  }
};

/**
 * Get cached images
 */
export const getCachedImages = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('Error getting cached images:', error);
    return null;
  }
};

/**
 * Check if API response has changed compared to cache
 */
export const hasResponseChanged = async (newImages) => {
  try {
    const cachedHash = await AsyncStorage.getItem(CACHE_HASH_KEY);
    const newHash = generateHash(newImages);
    return cachedHash !== newHash;
  } catch (error) {
    console.error('Error checking response change:', error);
    return true; // Assume changed if error
  }
};

/**
 * Clear all cache
 */
export const clearCache = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    await AsyncStorage.removeItem(CACHE_HASH_KEY);
    console.log('Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
