import * as MediaLibrary from 'expo-media-library';
import Files from '@/interfaces/Files'; 

export const getAllAudioFiles = async (): Promise<Files[]> => {
  const media = await MediaLibrary.getAssetsAsync({
    mediaType: 'audio',
    // You can remove or modify the `first` limit based on your needs
    first: 50,  // Fetch up to 50 files, for example
  });

  const getAllAudioFiles: Files[] = media.assets.map(asset => ({
    albumId: asset.albumId ?? 0, 
    creationTime: asset.creationTime ?? 0,
    duration: asset.duration ?? "No data on duration",
    filename: asset.filename ?? "Unknown audio file",
    height: asset.height ?? 0,
    id: asset.id ?? 0,
    mediaType: 'audio',
    modificationTime: asset.modificationTime ?? 0,
    uri: asset.uri,
    width: asset.width ?? 0
  }));

  console.log(getAllAudioFiles);
  return getAllAudioFiles;
};
export const fetchSongs = async (trackName: string, apiCode: string) => {
  try {
    const response = await fetch(`https://api.genius.com/search?q=${trackName}`, {
      headers: {
        Authorization: `Bearer ${apiCode}`,
      },
    });

    const data = await response.json();
    return data.response.hits[0]?.result || null;  // Return the first result or null
  } catch (error) {
    console.error('Error fetching songs:', error);
    return null;  // Return null on error
  }
};