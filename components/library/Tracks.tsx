import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AudioPlayerContext } from '@/components/context/AudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Files from '@/interfaces/Files';

export default function Tracks() {
  const [tracks, setTracks] = useState<Files[]>([]);
  const { playAudio } = useContext(AudioPlayerContext);

  useEffect(() => {
    (async () => {
      const allTracks: Files[] = [];

      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      console.log("All AsyncStorage keys:", keys);

      // Filter out the keys related to artist images
      const trackKeys = keys.filter(key => key.startsWith('artistImage_'));
      console.log("Track keys:", trackKeys);

      for (const key of trackKeys) {
        const trackId = key.split('artistImage_')[1]; // Extract track ID from the key
        console.log(`Fetching data for track: ${trackId}`);

        // Fetch the song data from AsyncStorage
        const artistImage = await AsyncStorage.getItem(`artistImage_${trackId}`);
        const songText = await AsyncStorage.getItem(`songText_${trackId}`);
        const artistName = await AsyncStorage.getItem(`artistName_${trackId}`);
        const songFilePath = await AsyncStorage.getItem(`songFilePath_${trackId}`);

        console.log(`Data for track ${trackId}:`, { artistImage, songText, artistName, songFilePath });

        // If all necessary data exists, add it to the tracks array
        if (artistImage && songText && artistName && songFilePath) {
          allTracks.push({
            id: trackId,
            filePath: songFilePath, // Use the file path for playing the audio
            artistImage: artistImage,
            songText: songText,
            artistName: artistName || 'Unknown Artist', // Default to "Unknown Artist" if no name is provided
          });
        }
      }

      console.log("All tracks:", allTracks);
      setTracks(allTracks);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {tracks.map(track => (
        <TouchableOpacity
          key={track.id}
          onPress={() => playAudio(track.filePath)}
          style={styles.trackItem}
        >
          <View style={styles.artistImageContainer}>
            {track.artistImage ? (
              <Image source={{ uri: track.artistImage }} style={styles.artistImage} />
            ) : (
              <Text style={styles.noArtworkText}>No Artwork</Text>
            )}
          </View>

          <View style={styles.trackDetails}>
            <Text style={styles.trackTitle}>{track.filePath}</Text>
            <Text style={styles.artistName}>{track.artistName}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    backgroundColor: '#1c1c1c',
  },
  artistImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noArtworkText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  trackDetails: {
    flexDirection: 'column',
    flex: 1,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  artistName: {
    fontSize: 14,
    color: '#888',
  },
});
