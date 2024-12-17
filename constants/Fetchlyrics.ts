const LYRICS_STORAGE_KEY = 'LYRICS_';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchLyricsByFilename = async (filename: string): Promise<string> => {
  try {
    const relevantText = filename.replace(/\.[^/.]+$/, '').trim();
    const [artist, title] = relevantText.split(' - '); 

    if (!artist || !title) {
      throw new Error('Invalid filename format. Ensure it is "Artist - Song Title"');
    }

    const storageKey = `${LYRICS_STORAGE_KEY}${relevantText}`;

    const cachedLyrics = await AsyncStorage.getItem(storageKey);
    if (cachedLyrics) {
      console.log('Fetching lyrics from local storage...');
      return cachedLyrics;
    }

    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    const url = `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`;
    console.log(`Requesting lyrics for: ${url}`);

    const response = await axios.get(url);

    if (response && response.data && response.data.lyrics) {
      const lyrics = response.data.lyrics;

      await AsyncStorage.setItem(storageKey, lyrics);
      console.log('Lyrics saved to local storage...');

      return lyrics;
    }

    return 'No lyrics found for this track.';
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return 'Error fetching lyrics or resource not found.';
  }
};
  export const clearAllLyricsData = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const lyricsKeys = allKeys.filter(key => key.startsWith(LYRICS_STORAGE_KEY));
      await AsyncStorage.multiRemove(lyricsKeys);
      console.log('All lyrics data removed from storage.');
    } catch (error) {
      console.error('Error clearing all lyrics data:', error);
    }
  };