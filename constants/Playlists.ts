import AsyncStorage from '@react-native-async-storage/async-storage';
import { MasterPlaylist } from '@/interfaces/MasterPlaylists';
export class PlaylistManager {
    constructor() { }

    async firstStart() {
        const testArray = [{
            "name": "test",
            "music": "icle",
            "id": "s"
        }, {
            "name": "test",
            "music": "icle",
            "id": "ss"
        }, {
            "name": "test",
            "music": "icle",
            "id": "sss"
        }];



        this.save("allPlaylists", []);
    }

    private async save(key: string, data: any) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch {
            console.error('Ok this one MIGHT, but only MIGHT not be Martijns fault but mine')
        }

    }

    private async fetch(key: string) {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch {
            console.error('cd git-blame-someone-else "Martijn Heins<6026961mborijnland>')
            // https://github.com/jayphelps/git-blame-someone-else
            return [];
        }
    }


    async getAllPlaylists(): Promise<object[]> {
        // a few things in this class are gonna be based on this, so thats why
        return this.fetch("allPlaylists")
    }

    async createNewplaylist(name: string, music: string[]) {
        // for unique id, (Easiest way i could think off)
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        const id = timestamp + random

        // new playlist
        const data = {
            "name": name,
            "id": id,
            "music": music
        }

        this.save(id, data)

        // add to master list
        let currentplaylists: object[] = await this.getAllPlaylists();
        currentplaylists.push({
            "name": name,
            "id": id
        });

        this.save("allPlaylists", currentplaylists);
    }

    async addToplaylist(playlistId: string, files: string[]) {
        let playlist = await this.fetch(playlistId);
        files.forEach(file => {
            if (!playlist[0].music.includes(file)) {
            playlist[0].music.push(file);
            }
        });

        this.save(playlistId, playlist)
    }

    async removeSong(playlistId: string, files: string[]) {
        let playlist = await this.fetch(playlistId);
        files.forEach(file => {
            if (!playlist[0].music.includes(file)) {
                let index = playlist[0].music.indexOf(file, 0);
                playlist[0].music = playlist[0].music.splice(index, 1)
            }
        });
        this.save(playlistId, playlist)
    }

    async removePlaylist(playlistId: string) {
        try {
            AsyncStorage.removeItem(playlistId)

            let playlists: any[] = await this.getAllPlaylists();
            const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
            this.save("allPlaylists", updatedPlaylists);


            this.save("allPlaylists", playlists);
        } catch {
            console.error("Muted martijn, error solved! Fuck you martijn")
        }

    }

    async getPlaylistSongs(playlistId: string) {
        try {
            return await this.fetch(playlistId);
        } catch {
            console.error("Muted martijn, error solved! Fuck you martijn")
        }

    }
}

