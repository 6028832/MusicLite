/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import Files from '@/interfaces/Files';
import {getPermissions} from '@/constants/GetPermission';
import {MasterList} from '@/interfaces/MasterList';

export class TracksManager {
  constructor() {
    // I hardly know her!
  }

  async firstBoot(forcedRestore: boolean = false) {
    try {
      await getPermissions(MediaLibrary.requestPermissionsAsync);
      const check = await this.getMasterList();
      if (check != null) {
        if (forcedRestore) {
          return;
        } else {
          check.forEach(async (item: any) => {
            AsyncStorage.removeItem(item.infoId);
          });
          AsyncStorage.removeItem('tracksMasterList');
        }
      }
      this.save('tracksMasterList', []);
      this.firstBootGetDownloadedMusic();
    } catch {
      console.error(
        'Martijn looked at my screen once during programming. Might result in numerous errors.'
      );
    }
  }

  private async save(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.error(
        'Uh oh! Martijn broke this again. For the 50th time. (and hes probably still blaming it on Anil)'
      );
    }
  }

  private async fetch(key: string) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      console.error('I was here');
      return [];
    }
  }

  async getMasterList() {
    return await this.fetch('tracksMasterList');
  }

  async updateMasterList(key: string, data: MasterList[]) {
    try {
      let currentMasterList: MasterList[] = await this.getMasterList();
      const updatedMasterList = currentMasterList.concat(data);
      await AsyncStorage.setItem(key, JSON.stringify(updatedMasterList));
    } catch {
      console.error('Blame it on racism');
    }
  }

  async saveSong(key: string, data: Files) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.error(
        'Seems like the end user ran into a skill issue (not our problem)'
      );
    }
  }

  async getAudioFiles(): Promise<Files[]> {
    // get
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
    });

    const getAllAudioFiles: Files[] = media.assets.map(asset => ({
      albumId: asset.albumId ?? 0,
      creationTime: asset.creationTime ?? 0,
      duration: asset.duration ?? 'No data on duration',
      filename: asset.filename ?? 'Unknown audio file',
      height: asset.height ?? 0,
      id: asset.id ?? 0,
      mediaType: 'audio',
      modificationTime: asset.modificationTime ?? 0,
      uri: asset.uri,
      width: asset.width ?? 0,
      imageUrl: '', // Add a default or fetch the actual image URL if available
      artist: '', // Add a default or fetch the actual artist if available
    }));

    return getAllAudioFiles;
  }

  async firstBootGetDownloadedMusic() {
    const getAllAudioFiles: Files[] = await this.getAudioFiles();

    let masterlist: MasterList[] = [];

    getAllAudioFiles.forEach(async (file: Files) => {
      masterlist.push({
        infoId: file.filename,
        name: file.filename,
        duration: file.duration,
        artist: file.artist,
        img: file.imageUrl,
      });

      await this.saveSong(file.filename, file);
    });
  }

  async backgroundGetDownloadedMusic() {
    const getAllAudioFiles: Files[] = await this.getAudioFiles();
    const masterList: MasterList[] = await this.getMasterList();

    getAllAudioFiles.forEach(async (file: Files) => {
      const existsInMasterList = masterList.some(
        item => item.infoId === file.filename
      );

      if (!existsInMasterList) {
        masterList.push({
          infoId: file.filename,
          name: file.filename,
          duration: file.duration,
          artist: file.artist,
          img: file.imageUrl,
        });

        await this.saveSong(file.filename, file);
      }
    });

    if (masterList.length > 0) {
      await this.save('tracksMasterList', masterList);
    }
  }

  async fetchTrack(trackId: string) {
    const audioTrack: Files = await this.fetch(trackId);
    return audioTrack;
  }

  async updateTrack(trackId: string, data: Files) {
    await this.save(trackId, data);
  }
}
