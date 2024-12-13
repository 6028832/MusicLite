import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSongs } from '@/constants/FetchSongs'; // Import fetchSongs function
import MusicMetadata from 'react-native-music-metadata';  // Import music metadata library

interface Files {
  albumId: number;
  creationTime: number;
  duration: string | number;
  filename: string;
  height: number;
  id: number;
  mediaType: string;
  modificationTime: number;
  uri: string;
  width: number;
  artist?: string;  // Optional artist field
  image?: string;   // Optional image field
}

const getApiEnabled = async (): Promise<boolean> => {
  const apiEnabled = await AsyncStorage.getItem('apiEnabled');
  return apiEnabled === '1';  // Return true if API is enabled
};

const getApiCode = async (): Promise<string> => {
  return await AsyncStorage.getItem('apiCode') || '';  // Return API code or empty string
};

// Function to get all audio files from the device
export const getAllAudioFiles = async (): Promise<Files[]> => {
  const media = await MediaLibrary.getAssetsAsync({
    mediaType: 'audio',
    first: 10,  // Limit the number of files (adjustable)
  });

  return media.assets.map(asset => ({
    albumId: asset.albumId ?? 0,
    creationTime: asset.creationTime ?? 0,
    duration: asset.duration ?? "No data on duration",
    filename: asset.filename ?? "Unknown audio file",
    height: asset.height ?? 0,
    id: asset.id ?? 0,
    mediaType: 'audio',
    modificationTime: asset.modificationTime ?? 0,
    uri: asset.uri,
    width: asset.width ?? 0,
  }));
};

// Function to store metadata locally (instead of writing to the MP3 file)
const storeMetadataLocally = async (fileUri: string, artist: string, imageUrl: string) => {
  try {
    const metadata = {
      artist: artist,
      imageUrl: imageUrl,
    };

    // Store metadata in AsyncStorage or a local database for later access
    await AsyncStorage.setItem(fileUri, JSON.stringify(metadata));

    console.log('(NOBRIDGE) LOG  Metadata stored for file:', fileUri);
  } catch (error) {
    console.error('(NOBRIDGE) LOG  Error storing metadata: ', error);
  }
};

// Function to update MP3 file metadata
const updateMp3Metadata = async (fileUri: string, artist: string, imageUrl: string) => {
  try {
    const metadata = await MusicMetadata.read(fileUri); // Read the existing metadata of the MP3 file

    const updatedMetadata = {
      ...metadata,
      common: {
        ...metadata.common,
        artist: artist, // Update the artist
      },
      picture: [{
        data: await fetchImage(imageUrl), // Convert image URL to binary data
        format: 'image/jpeg',  // Assuming JPEG format for the image
      }],
    };

    // Write the new metadata to the MP3 file
    await MusicMetadata.write(fileUri, updatedMetadata);

    console.log('(NOBRIDGE) LOG  MP3 Metadata updated successfully.');
  } catch (error) {
    console.error('(NOBRIDGE) LOG  Error updating MP3 metadata:', error);
  }
};

// Main function to process all audio files and use Genius API to get song data
export const processAudioFiles = async () => {
  const apiEnabled = await getApiEnabled();
  if (!apiEnabled) {
    console.log('(NOBRIDGE) LOG  API is disabled.');
    return;  // Exit if the API is disabled
  }

  const apiCode = await getApiCode();
  if (!apiCode) {
    console.error('(NOBRIDGE) LOG  API code is not set.');
    return;  // Exit if the API code is missing
  }

  const audioFiles = await getAllAudioFiles();
  for (const audioFile of audioFiles) {
    const trackName = audioFile.filename.replace('.mp3', '');  // Assuming filename is track name

    // Log the track and artist before fetching new data
    console.log(`(NOBRIDGE) LOG  Song found: ${trackName} by ${audioFile.artist ?? 'Unknown Artist'}`);

    // Fetch song data using fetchSongs from fetchSongs.ts
    const songData = await fetchSongs(trackName, apiCode);

    if (songData) {
      // Log the new artist and image
      console.log(`(NOBRIDGE) LOG  Artist: ${songData.primary_artist.name}`);

      // Overwrite the artist and image fields with the new data
      audioFile.artist = songData.primary_artist.name; // Set the artist name
      audioFile.image = songData.primary_artist.image_url; // Set the artist's image URL

      // Store the metadata locally
      const filePath = audioFile.uri;  // Use the URI to get the file path
      await storeMetadataLocally(filePath, audioFile.artist, audioFile.image);

      // Update MP3 file metadata with new artist and image
      await updateMp3Metadata(filePath, audioFile.artist, audioFile.image);

      // Optionally, log the new artist and image values
      console.log(`(NOBRIDGE) LOG  Updated Artist: ${audioFile.artist}`);
      console.log(`(NOBRIDGE) LOG  Updated Image URL: ${audioFile.image}`);
    } else {
      console.log(`(NOBRIDGE) LOG  No song found for: ${trackName}`);
    }
  }
};

// Helper function to fetch image binary data from a URL (for embedding in MP3 metadata)
const fetchImage = async (url: string) => {
  const response = await fetch(url);
  const imageBuffer = await response.arrayBuffer();
  return Buffer.from(imageBuffer);
};
