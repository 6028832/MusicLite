import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library'
import { createAlbums } from '@/components/navigation/utils/albumutils';
import AlbumPopup from '@/components/albumpopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlbumsManager } from '@/constants/Albums';
    
type Album = {
    id: string;
    artist: string;
    name: string;
}
    
export default function Albums() {

    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);    
    const manager = new AlbumsManager();
    

    useEffect(() => {
        const currentAlbums = manager.getAllAlbums()
            .then(currentAlbums => setAlbums(currentAlbums))
            .catch((error) => {
                console.error('Error fetching albums:', error);
                manager.firstStart();
                setAlbums([]);
            })
            .finally(() => setLoading(false));
    }, [])

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
                            <Text style={styles.albumTitle}>{album.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <AlbumPopup album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
        </SafeAreaView>
    );
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
