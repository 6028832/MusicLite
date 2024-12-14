import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tracks = ({ clearTrackData }: { clearTrackData: (trackId: string) => void }) => {
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTracks() {
      const keys = await AsyncStorage.getAllKeys();
      const trackKeys = keys.filter(key => key.startsWith('artistImage_'));

      const allTracks = [];
      for (const key of trackKeys) {
        const trackId = key.split('artistImage_')[1];
        const artistImage = await AsyncStorage.getItem(`artistImage_${trackId}`);
        const songText = await AsyncStorage.getItem(`songText_${trackId}`);
        const artistName = await AsyncStorage.getItem(`artistName_${trackId}`);
        const songFilePath = await AsyncStorage.getItem(`songFilePath_${trackId}`);

        if (artistImage && songText && artistName && songFilePath) {
          allTracks.push({
            id: trackId,
            filePath: songFilePath,
            artistImage: artistImage,
            songText: songText,
            artistName: artistName,
          });
        }
      }
      setTracks(allTracks);
    }

    fetchTracks();
  }, []);

  return (
    <View>
      {tracks.map(track => (
        <View key={track.id} style={styles.trackItem}>
          <Text>{track.artistName}</Text>
          <TouchableOpacity onPress={() => clearTrackData(track.id)} style={styles.clearButton}>
            <Text style={styles.buttonText}>Clear Data</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  clearButton: {
    marginLeft: 10,
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Tracks;
