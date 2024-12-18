/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class AlbumsManager {
  constructor() {}
  async firstBoot(forcedRestore: boolean = false) {
    try {
      const check = await this.getAllAlbums();
      if (check != null) {
        if (forcedRestore) {
          return;
        } else {
          check.forEach(async (item: any) => {
            AsyncStorage.removeItem(item.infoId);
          });
          AsyncStorage.removeItem('allAlbums');
        }
      }

      this.save('allAlbums', []);
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
        'Ok this one MIGHT, but only MIGHT not be Martijns fault but mine'
      );
    }
  }

  private async fetch(key: string) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      console.error(
        'cd git-blame-someone-else "Martijn Heins<6026961mborijnland>'
      );
      // https://github.com/jayphelps/git-blame-someone-else
      return [];
    }
  }

  async getAllAlbums(): Promise<object[]> {
    // a few things in this class are gonna be based on this, so thats why
    return this.fetch('allAlbums');
  }

  async createNewAlbum(name: string, music: string[], artist: string) {
    // for unique id, (Easiest way i could think off)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const id = timestamp + random;

    // new album
    const data = {
      name: name,
      id: id,
      artist: artist,
      coverArt: '',
      music: music,
    };

    this.save(id, data);

    // add to master list
    let currentalbums: object[] = await this.getAllAlbums();
    currentalbums.push({
      name: name,
      artist: artist,
      id: id,
    });

    this.save('allAlbums', currentalbums);
  }

  async addToAlbum(albumId: string, files: string[]) {
    let album = await this.fetch(albumId);
    files.forEach(file => {
      if (!album.music.includes(file)) {
        album.music.push(file);
      }
    });

    this.save(albumId, album);
  }

  async removeSong(albumId: string, files: string[]) {
    let album = await this.fetch(albumId);
    album.music = album.music.filter((song: any) => !files.includes(song));
    this.save(albumId, album);
  }

  async removeAlbum(albumId: string) {
    try {
      await AsyncStorage.removeItem(albumId);

      let albums: any[] = await this.getAllAlbums();
      const updateAlbums = albums.filter(p => p.id !== albumId);

      this.save('allAlbums', updateAlbums);
    } catch {
      console.error('Muted martijn, error solved! Fuck you martijn');
    }
  }

  async getalbumSongs(albumId: string) {
    const album = await this.fetch(albumId);
    if (!album || !album.music) {
      console.error('album not found or invalid structure.');
      return [];
    }
    return album.music;
  }
}
