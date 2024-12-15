import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getAlbums } from '@/components/navigation/utils/albumutils';
import AlbumPopup from '@/components/albumpopup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tracks from '@/constants/fillininfo';  
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
      const homeAlbums = await getAlbums(3);
      setAlbums(homeAlbums);
    }

    fetchAlbums();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Albums</Text>
      
      <ScrollView>
        {albums.map((album) => (
          <TouchableOpacity
            key={album.id}
            style={styles.albumCard}
            onPress={() => setSelectedAlbum(album)}
          >
            <Text style={styles.albumTitle}>{album.title}</Text>
          </TouchableOpacity>
        ))}
        
        {/* Tracks component */}
        <Tracks clearTrackData={clearTrackData} /> {/* Pass the clearTrackData function to Tracks */}
  
      </ScrollView>
  
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
