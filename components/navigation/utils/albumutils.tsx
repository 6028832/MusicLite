import AsyncStorage from '@react-native-async-storage/async-storage';

const albumNames = [
    "Chill Vibes",
    "Deep Focus",
    "Throwback Hits",
    "Summer Breeze",
    "Workout Beats",
    "Jazz Essentials",
    "Indie Spotlight",
    "Classic Rock",
    "Pop Rising",
    "Lo-Fi Study",
    "Hip-Hop Classics",
    "Acoustic Mornings",
    "Evening Acoustic",
    "Dance Party",
    "Mood Booster",
    "Sad Songs",
    "Relax & Unwind",
    "Feel Good Hits",
    "Latin Heat",
    "Country Classics",
];

export async function createAlbums(mp3Files: any[], saveToStorage = true) {
    const albums: any[] = [];
    let albumCount = 0;

    for (let i = 0; i < mp3Files.length; i += 5) {
        const album = {
            id: `album-${++albumCount}`,
            title: albumNames[Math.floor(Math.random() * albumNames.length)],
            songs: mp3Files.slice(i, i + 5).map((file) => ({
                id: file.id,
                filename: file.filename,
                duration: file.duration,
                uri: file.uri,
                thumbnail: file.uri,
            })),
        };
        albums.push(album);
    }

    if (saveToStorage) {
        await AsyncStorage.setItem('albums', JSON.stringify(albums));
    }

    return albums;
}

export async function getAlbums(limit?: number) {
    const jsonAlbums = await AsyncStorage.getItem('albums');
    const albums = jsonAlbums ? JSON.parse(jsonAlbums) : [];
    return limit ? albums.slice(0, limit) : albums;
}
