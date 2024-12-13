import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getAlbums } from '@/components/navigation/utils/albumutils';
import AlbumPopup from '@/components/albumpopup';

export default function Home() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

    useEffect(() => {
        async function fetchAlbums() {
            const homeAlbums = await getAlbums(3); // Haal 3 albums op
            setAlbums(homeAlbums);
        }

        fetchAlbums();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Featured Albums</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

            {/* Conditionally render the AlbumPopup */}
            {selectedAlbum && (
                <AlbumPopup album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
            )}
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
        width: 150,  // Ensure a specific width to make album cards more uniform
        alignItems: 'center',
    },
    albumTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
