import AsyncStorage from '@react-native-async-storage/async-storage';

// might be an albums copy and paste
export class Playlists {
    constructor() { }

    private async save(key:string, data:any) {
        try{
            await AsyncStorage.setItem(key, JSON.stringify(data));
        }catch{
            console.log('Ok this one MIGHT, but only MIGHT not be Martijns fault but mine')
        }
        
    }

    private async fetch(key:string): Promise<string | null | undefined> {
        try {
            const data = await AsyncStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch {
            console.log('cd git-blame-someone-else "Martijn Heins<6026961mborijnland>')
            // https://github.com/jayphelps/git-blame-someone-else
        }
    }


    async getPlayLists() {
        // a few things in this class are gonna be based on this, so thats why
        return this.fetch("allplaylists")
    }

    async createPlaylist(name: string, coverImg: string, artist: string, music: string[]) {
        // for unique id, (Easiest way i could think off)
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        const id = timestamp + random

        // new album
        const data = {
                "name": name,
                "music": music,
                "id": id
            }
        this.save(id, data)

        // add to master list
        let currentPlaylists = this.getPlayLists();
        currentPlaylists.append({
            "name": name,
            "id": id
        });

        this.save("allplaylists", currentPlaylists);
    }


    async removeSong(id: string, files: string[]) {
        let playlist = this.fetch(id);s
        files.forEach(file => {
            if (!playlist[0].music.includes(file)) {
                let index = playlist[0].music.indexOf(file, 0);
                playlist[0].music = playlist[0].music.splice(index, 1)
            }
        });
        this.save(albumId, album)
    }

    async removeAlbum(id: string) {
        let playlists = this.getPlayLists();
        let index = playlists[0].indexOf(id, 0);
        playlists[0].music = playlists[0].splice(index, 1);

        this.save("allplaylists", playlists);
    }
}
