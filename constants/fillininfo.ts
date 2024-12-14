import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getAllAudioFiles } from '@/constants/FetchSongs';
import { getApiCode, getApiEnabled } from '@/components/navigation/utils/apiSettings';

// Function to fetch song data from Genius API
const fetchSongs = async (trackName: string, apiCode: string) => {
   try {
     const baseUrl = 'https://api.genius.com/search';
     
     const response = await axios.get(baseUrl, {
       headers: {
         Authorization: `Bearer ${apiCode}`,
       },
       params: {
         q: trackName,
       },
     });
     
     if (response.data?.response?.hits?.length > 0) {
       const song = response.data.response.hits[0].result;
       
       return {
         title: song.full_title,
         primary_artist: {
           name: song.primary_artist.name,
           image_url: song.primary_artist.image_url,
         },
         lyrics_path: song.path,
       };
     } else {
       console.error(`No results found for ${trackName}`);
       return null;
     }
   } catch (error) {
     console.error('Error fetching song data from Genius API:', error);
     return null;
   }
};

// Function to fetch and store song data in AsyncStorage
const fetchAndStoreSongData = async (trackName: string, fileId: string, apiCode: string) => {
   try {
     // Remove previous song data (optional but safer)
     await AsyncStorage.removeItem(`songData_${fileId}`);
     
     // Fetch song data from Genius API
     const songData = await fetchSongs(trackName, apiCode);
     if (!songData) {
       console.error(`No song data found for: ${trackName}`);
       return null;
     }
     
     // Prepare JSON data
     const songDataJSON = JSON.stringify({
       artistImage: songData.primary_artist.image_url,
       songTextUrl: `https://genius.com${songData.lyrics_path}`,
       title: songData.title,
       artistName: songData.primary_artist.name,
     });
     
     // Store the song data JSON in AsyncStorage
     await AsyncStorage.setItem(`songData_${fileId}`, songDataJSON);
     
     console.log(`Song data for ${trackName} stored in AsyncStorage`);
     return songDataJSON;
   } catch (error) {
     console.error('Error fetching or storing song data:', error);
     return null;
   }
};

// Function to process all songs on the device
export const fillInAllMusic = async () => {
   try {
     // Check if API is enabled
     const apiEnabled = await getApiEnabled();
     if (!apiEnabled) {
       console.error('API is not enabled');
       return;
     }
     
     // Retrieve the API code from settings
     const apiCode = await getApiCode();
     if (!apiCode) {
       console.error('API code is not available');
       return;
     }
     
     // Get all audio files from the device
     const audioFiles = await getAllAudioFiles();
     if (!audioFiles || audioFiles.length === 0) {
       console.error('No audio files found on the device');
       return;
     }
     
     // Loop through all audio files and fetch song information
     const results = [];
     for (const file of audioFiles) {
       const trackName = file.filename.split('.').slice(0, -1).join('.');
       
       // Fetch and store the song data
       const songData = await fetchAndStoreSongData(trackName, file.id, apiCode);
       if (songData) {
         results.push({ fileId: file.id, trackName, songData });
       }
     }
     
     console.log('All song data processed and stored');
     return results;
   } catch (error) {
     console.error('Error filling in music data for all songs:', error);
     return null;
   }
};