import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAlbums } from '@/components/navigation/utils/albumutils';
import AlbumPopup from '@/components/albumpopup';
import { processAudioFiles } from '@/components/navigation/utils/procesaudiofiles';

export default function Home() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);  // State for managing loading status

    useEffect(() => {
        async function fetchAlbums() {
            const homeAlbums = await getAlbums(3); // Haal 3 albums op
            setAlbums(homeAlbums);
        }

        fetchAlbums();
    }, []);

    // Handle button press to process audio files
    const handleButtonPress = async () => {
        setLoading(true);  // Start loading
        await processAudioFiles();
        setLoading(false);  // Stop loading
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Featured Albums</Text>
            <ScrollView horizontal>
                {albums.map((album) => (
                    <TouchableOpacity
                        key={album.id}
                        style={styles.albumCard}
                        onPress={() => setSelectedAlbum(album)}
                    >
                        <Text style={styles.albumTitle}>{album.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <AlbumPopup album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />

            {/* Sync button to trigger processAudioFiles */}
            <TouchableOpacity style={styles.syncButton} onPress={handleButtonPress}>
                <Text style={styles.syncButtonText}>Sync Audio Files</Text>
            </TouchableOpacity>

            {/* Show a loading spinner while the function is processing */}
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    albumCard: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginRight: 10,
    },
    albumTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    syncButton: {
        marginTop: 20,
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
