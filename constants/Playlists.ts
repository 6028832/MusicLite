/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
export class PlaylistManager {
  constructor() {}

  async firstStart() {
    const testArray = [
      {name: 'test1', music: [], id: 's'},
      {name: 'test2', music: [], id: 'ss'},
      {name: 'test3', music: [], id: 'sss'},
    ];

    for (let playlist of testArray) {
      this.save(playlist.id, playlist);
    }

    this.save(
      'allPlaylists',
      testArray.map(p => ({name: p.name, id: p.id}))
    );
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

  async getAllPlaylists(): Promise<object[]> {
    // a few things in this class are gonna be based on this, so thats why
    return this.fetch('allPlaylists');
  }

  async createNewplaylist(name: string, music: string[]) {
    // for unique id, (Easiest way i could think off)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const id = timestamp + random;

    // new playlist
    const data = {
      name: name,
      id: id,
      music: music,
    };

    this.save(id, data);

    // add to master list
    let currentplaylists: object[] = await this.getAllPlaylists();
    currentplaylists.push({
      name: name,
      id: id,
    });

    this.save('allPlaylists', currentplaylists);
  }

  async addToplaylist(playlistId: string, files: string[]) {
    let playlist = await this.fetch(playlistId);
    files.forEach(file => {
      if (!playlist.music.includes(file)) {
        playlist.music.push(file);
      }
    });

    this.save(playlistId, playlist);
  }

  async removeSong(playlistId: string, files: string[]) {
    let playlist = await this.fetch(playlistId);
    playlist.music = playlist.music.filter(
      (song: any) => !files.includes(song)
    );
    this.save(playlistId, playlist);
  }

  async removePlaylist(playlistId: string) {
    try {
      await AsyncStorage.removeItem(playlistId);

      let playlists: any[] = await this.getAllPlaylists();
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);

      this.save('allPlaylists', updatedPlaylists);
    } catch {
      console.error('Muted martijn, error solved! Fuck you martijn');
    }
  }

  async getPlaylistSongs(playlistId: string) {
    const playlist = await this.fetch(playlistId);
    if (!playlist || !playlist.music) {
      console.error('Playlist not found or invalid structure.');
      return [];
    }
    return playlist.music;
  }
}
