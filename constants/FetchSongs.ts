import * as MediaLibrary from 'expo-media-library';
import Files from '@/interfaces/Files'; 

export const getAllAudioFiles = async (): Promise<Files[]> => {
  const media = await MediaLibrary.getAssetsAsync({
    mediaType: 'audio',
    first: 2,  // Limit the number of files
  });
  
  const audioFiles: Files[] = media.assets.map(asset => ({
    albumId: asset.albumId ?? 0, 
    creationTime: asset.creationTime ?? 0,
    duration: asset.duration ?? "No data on duration",
    filename: asset.filename ?? "Unkown audio file",
    height: asset.height ?? 0,
    id: asset.id ?? 0,
    mediaType: 'audio',
    modificationTime: asset.modificationTime ?? 0,
    uri: asset.uri,
    width: asset.width ?? 0
  }));

  console.log(audioFiles);
  return audioFiles;
};