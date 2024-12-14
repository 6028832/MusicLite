import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getAlbums } from '@/components/navigation/utils/albumutils';
import AlbumPopup from '@/components/albumpopup';
import { fillInAllMusic } from '@/constants/fillininfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tracks from '@/components/Trackscomp';  // Assuming Tracks component is imported

// Function to clear track data
const clearTrackData = async (trackId: string) => {
  try {
    await AsyncStorage.removeItem(`artistImage_${trackId}`);
    await AsyncStorage.removeItem(`songText_${trackId}`);
    console.log(`Data for track ${trackId} cleared from AsyncStorage`);
  } catch (error) {
    console.error('Error clearing track data:', error);
  }
};

export default function Home() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);

  useEffect(() => {
    async function fetchAlbums() {
      const homeAlbums = await getAlbums(3); // Get 3 albums
      setAlbums(homeAlbums);
    }

    fetchAlbums();
    fillInAllMusic();  // Fill in all music when the Home component is loaded
  }, []);

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

      {/* Tracks component */}
      <Tracks clearTrackData={clearTrackData} />  {/* Pass the clearTrackData function to Tracks */}

      <AlbumPopup album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
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
});
