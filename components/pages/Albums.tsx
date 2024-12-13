import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library'
import { createAlbums } from '@/components/navigation/utils/albumutils';
import AlbumPopup from '@/components/albumpopup';


export default function Albums() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlbums();

        // elke 30 minuten shyuffeled hij de alvums
        const intervalId = setInterval(() => {
            reorganizeAlbums();
        }, 1800000); // 30 minutes

        return () => clearInterval(intervalId); // Cleanup de interval component
    }, []);

    async function fetchAlbums() {
        setLoading(true);

        try {
            const permissionResponse = await MediaLibrary.requestPermissionsAsync();
            if (!permissionResponse.granted) {
                console.error('MediaLibrary permission not granted');
                setLoading(false);
                return;
            }

            const assets = await MediaLibrary.getAssetsAsync({ mediaType: 'audio' });
            const mp3Files = assets.assets.filter((file) => file.filename.endsWith('.mp3'));

            if (mp3Files.length > 0) {
                const generatedAlbums = await createAlbums(mp3Files);
                setAlbums(generatedAlbums);
            } else {
                console.warn('No MP3 files found');
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
        } finally {
            setLoading(false);
        }
    }

    function reorganizeAlbums() {
        if (albums.length < 2) return; 
        const shuffledAlbums = shuffleAlbums(albums);
        setAlbums(shuffledAlbums);
    }

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <Text style={styles.loadingText}>Loading albums...</Text>
            ) : (
                <ScrollView>
                    {albums.map((album) => (
                        <TouchableOpacity
                            key={album.id}
                            style={styles.albumContainer}
                            onPress={() => setSelectedAlbum(album)}
                        >
                            <Text style={styles.albumTitle}>{album.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <AlbumPopup album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
        </SafeAreaView>
    );
}

function shuffleAlbums(albums: any[]) {
    let allSongs: any[] = [];
    albums.forEach((album) => {
        album.songs.forEach((song) => {
            allSongs.push(song);
        });
    });

    let reorganizedAlbums = albums.map((album, index) => {
        const shuffledSongs = allSongs
            .sort(() => Math.random() - 0.5) 
            .slice(0, Math.max(2, album.songs.length));
        return { ...album, songs: shuffledSongs };
    });

    return reorganizedAlbums;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    albumContainer: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    albumTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
