import * as MediaLibrary from 'expo-media-library';
import Files from '@/interfaces/Files'; 

export class FetchAudioFiles {

    constructor(){}


    async getAudioFiles(): Promise<Files[]> {
        const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
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

          return getAllAudioFiles;
    }


}