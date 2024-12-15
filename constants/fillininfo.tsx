import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, StyleSheet, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GeniusAPI_BASE_URL = 'https://api.genius.com'; 

export const getApiCode = async () => {
  const apiCode = await AsyncStorage.getItem('apiCode') || '';
  console.log('Fetched API code from AsyncStorage:', apiCode);
  return apiCode;
};

const Tracks: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [geniusAccessToken, setGeniusAccessToken] = useState<string>('');

  const fetchTrackInfo = async (trackTitle: string, artist: string) => {
    console.log(`Fetching track info for: ${trackTitle} by ${artist}`);
    try {
      const searchTrack = async (query: string) => {
        const response = await fetch(
          `${GeniusAPI_BASE_URL}/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${geniusAccessToken}`, 
            },
          }
        );
        const data = await response.json();
        console.log('Genius API search result:', data);
        return data.response.hits;
      };

      let hits = await searchTrack(trackTitle);
      if (hits.length === 0) {
        console.log('No track found, searching for artist...');
        hits = await searchTrack(artist);
      }

      if (hits.length === 0) {
        console.warn('No track found for:', trackTitle, artist);
        return { artist: 'Unknown Artist', imageUrl: '' };  
      }

      const hit = hits[0];
      console.log(`Found track: ${trackTitle} by ${hit.result.primary_artist.name}`);
      return {
        artist: hit.result.primary_artist.name,
        imageUrl: hit.result.primary_artist.image_url,
      };
    } catch (error) {
      console.error('Error fetching Genius track info:', error);
      return { artist: 'Unknown Artist', imageUrl: '' };  
    }
  };

  const getTracksFromLibrary = async () => {
    setLoading(true);
    console.log('Accessing media library...');
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
      });

      console.log(`Found ${assets.length} audio files in library.`);

      const tracksWithInfo = await Promise.all(
        assets.map(async (asset) => {
          let trackTitle = '';
          let artist = '';

          const match = asset.filename.match(/(.*?)(?:\s*\((.*?)\))?\.mp3/);

          if (match) {
            trackTitle = match[1].trim();
            artist = match[2] ? match[2].trim() : '';  
          } else {
            const parts = asset.filename.split(' - ').map((part) => part.trim());
            trackTitle = parts[0];
            artist = parts[1] || '';  
          }

          const trackInfo = await fetchTrackInfo(trackTitle, artist);
          return { ...asset, ...trackInfo };
        })
      );

      console.log('Fetched track information:', tracksWithInfo);
      setTracks(tracksWithInfo);
    } catch (error) {
      console.error('Error accessing media library:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadApiCode = async () => {
      const apiCode = await getApiCode();
      setGeniusAccessToken(apiCode); 
      console.log('Access token set:', apiCode);
    };

    loadApiCode();
  }, []);

  useEffect(() => {
    if (geniusAccessToken) {
      console.log('Genius API token available. Fetching tracks...');
      getTracksFromLibrary();
    }
  }, [geniusAccessToken]);

  if (loading) {
    return <Text style={styles.loadingText}>Loading tracks...</Text>;
  }

  return (
    <View style={styles.container}>
      <Button title="Load Tracks" onPress={getTracksFromLibrary} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {tracks.map((track, index) => (
          <View key={index} style={styles.trackContainer}>
            {track.imageUrl ? (
              <Image source={{ uri: track.imageUrl }} style={styles.image} />
            ) : (
              <Text style={styles.noImageText}>No image available</Text>
            )}
            <Text style={styles.trackTitle}>{track.filename}</Text>
            <Text style={styles.artistName}>{track.artist}</Text>
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
  trackContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  trackTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',  
  },
  artistName: {
    color: 'white', 
  },
  noImageText: {
    color: 'white',  
  },
});

export default Tracks;
