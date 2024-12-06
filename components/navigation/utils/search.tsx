import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_STORAGE_KEY = 'recentSearches';

/**
 * Fetch recent searches from AsyncStorage.
 */
export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const savedSearches = await AsyncStorage.getItem(SEARCH_STORAGE_KEY);
    return savedSearches ? JSON.parse(savedSearches) : [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }
};

/**
 * Save a new search query to AsyncStorage.
 */
export const saveSearchQuery = async (query: string): Promise<string[]> => {
  try {
    const recentSearches = await getRecentSearches();
    const updatedSearches = [query, ...recentSearches.filter((q) => q !== query)].slice(0, 5); // Limit to 5
    await AsyncStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updatedSearches));
    return updatedSearches;
  } catch (error) {
    console.error('Error saving search query:', error);
    return [];
  }
};

/**
 * Remove a specific search query from AsyncStorage.
 */
export const removeSearchQuery = async (query: string): Promise<string[]> => {
  try {
    const recentSearches = await getRecentSearches();
    const updatedSearches = recentSearches.filter((q) => q !== query);
    await AsyncStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updatedSearches));
    return updatedSearches;
  } catch (error) {
    console.error('Error removing search query:', error);
    return [];
  }
};
