import AsyncStorage from '@react-native-async-storage/async-storage';

export class AlbumsManager {
  constructor() {}

  async firstStart() {
    this.save('allAlbums', []);
  }

  private async save(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch {
      console.log(
        'Ok this one MIGHT, but only MIGHT not be Martijns fault but mine'
      );
    }
  }

  private async fetch(key: string) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      console.log(
        'cd git-blame-someone-else "Martijn Heins<6026961mborijnland>'
      );
      // https://github.com/jayphelps/git-blame-someone-else
      return [];
    }
  }

  async getAllAlbums() {
    // a few things in this class are gonna be based on this, so thats why
    return this.fetch('allAlbums');
  }

  async createNewAlbum(
    name: string,
    coverImg: string,
    artist: string,
    music: string[]
  ) {
    // for unique id, (Easiest way i could think off)
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const id = timestamp + random;

    // new album
    const data = {
      name: name,
      artist: artist,
      music: music,
      id: id,
    };
    this.save(id, data);

    // add to master list
    let currentAlbums: any = this.getAllAlbums();
    currentAlbums.push({
      name: name,
      artist: artist,
      id: id,
    });

    this.save('allAlbums', currentAlbums);
  }

  async addToAlbum(albumId: string, files: string[]) {
    let album = await this.fetch(albumId);
    files.forEach(file => {
      if (!album[0].music.includes(file)) {
        album[0].music.push(file);
      }
    });

    this.save(albumId, album);
  }

  async removeSong(albumId: string, files: string[]) {
    let album = await this.fetch(albumId);
    files.forEach(file => {
      if (!album[0].music.includes(file)) {
        let index = album[0].music.indexOf(file, 0);
        album[0].music = album[0].music.splice(index, 1);
      }
    });
    this.save(albumId, album);
  }

  async removeAlbum(albumId: string) {
    let albums = await this.getAllAlbums();
    let index = albums[0].indexOf(albumId, 0);
    albums[0].music = albums[0].splice(index, 1);

    this.save('allAlbums', albums);
  }
}

