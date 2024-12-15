import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const albumNames = [
    "Chill Vibes", "Deep Focus", "Throwback Hits", "Summer Breeze", 
    "Workout Beats", "Jazz Essentials", "Indie Spotlight", "Classic Rock", 
    "Pop Rising", "Lo-Fi Study", "Hip-Hop Classics", "Acoustic Mornings", 
    "Evening Acoustic", "Dance Party", "Mood Booster", "Sad Songs", 
    "Relax & Unwind", "Feel Good Hits", "Latin Heat", "Country Classics"
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

const Albums: React.FC = () => {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadAlbums = async () => {
        setLoading(true);
        try {
            const fetchedAlbums = await getAlbums(); // Fetch the albums
            setAlbums(fetchedAlbums);
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlbums();
    }, []);

    if (loading) {
        return <Text style={styles.loadingText}>Loading albums...</Text>;
    }

    return (
        <View style={styles.container}>
            <Button title="Load Albums" onPress={loadAlbums} />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {albums.map((album, index) => (
                    <View key={index} style={styles.albumContainer}>
                        <Text style={styles.albumTitle}>{album.title}</Text>
                        {album.songs.map((song, songIndex) => (
                            <View key={songIndex} style={styles.songContainer}>
                                <Image source={{ uri: song.thumbnail }} style={styles.image} />
                                <Text style={styles.songTitle}>{song.filename}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        padding: 10,
    },
    loadingText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    scrollContainer: {
        alignItems: 'center',
    },
    albumContainer: {
        marginBottom: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        paddingBottom: 10,
    },
    albumTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
        marginBottom: 10,
    },
    songContainer: {
        marginBottom: 10,
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 16,
        color: 'white',
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
});

export default Albums;
