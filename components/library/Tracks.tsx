/** @format */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useMusicPlayer} from '@/components/context/AudioPlayer';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/hooks/useTheme';

const GeniusAPI_BASE_URL = 'https://api.genius.com';

export const getApiCode = async () => {
  const apiCode = (await AsyncStorage.getItem('apiCode')) || '';
  console.log('Fetched API code from AsyncStorage:', apiCode);
  return apiCode;
};

export default function Tracks() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [geniusAccessToken, setGeniusAccessToken] = useState<string>('');
  const {playTrack} = useMusicPlayer();
  const { colors } = useTheme('dark');
  
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
        return {artist: 'Unknown Artist', imageUrl: ''};
      }

      const hit = hits[0];
      console.log(
        `Found track: ${trackTitle} by ${hit.result.primary_artist.name}`
      );
      return {
        artist: hit.result.primary_artist.name,
        imageUrl: hit.result.primary_artist.image_url,
      };
    } catch (error) {
      console.error('Error fetching Genius track info:', error);
      return {artist: 'Unknown Artist', imageUrl: ''};
    }
  };

  const getTracksFromLibrary = async () => {
    setLoading(true);
    console.log('Accessing media library...');
    try {
      const {assets} = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
      });

      console.log(`Found ${assets.length} audio files in library.`);

      const tracksWithInfo = await Promise.all(
        assets.map(async asset => {
          let trackTitle = '';
          let artist = '';

          const match = asset.filename.match(/(.*?)(?:\s*\((.*?)\))?\.mp3/);

          if (match) {
            trackTitle = match[1].trim();
            artist = match[2] ? match[2].trim() : '';
          } else {
            const parts = asset.filename.split(' - ').map(part => part.trim());
            trackTitle = parts[0];
            artist = parts[1] || '';
          }

          // Apply search-like behavior here
          const trackInfo = await fetchTrackInfo(trackTitle, artist);
          return {...asset, ...trackInfo};
        })
      );

      console.log('Fetched track information:', tracksWithInfo);
      setTracks(tracksWithInfo);
      await AsyncStorage.setItem('savedTracks', JSON.stringify(tracksWithInfo)); // Save to AsyncStorage
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

  // Load saved tracks from AsyncStorage on page load
  useEffect(() => {
    const loadSavedTracks = async () => {
      try {
        const storedTracks = await AsyncStorage.getItem('savedTracks');
        if (storedTracks) {
          setTracks(JSON.parse(storedTracks));
          console.log('Loaded tracks from AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading tracks from AsyncStorage:', error);
      }
    };
    loadSavedTracks();
  }, []);

  const placeholderImage = 'https://via.placeholder.com/100';

  return loading ? (
    <Text style={styles.loadingText}>Loading tracks...</Text>
  ) : (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {tracks.map((track, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trackContainer}
            onPress={() => playTrack(track)} // Play track on press
          >
            <View style={styles.trackDetails}>
              <Image
                source={{uri: track.imageUrl || placeholderImage}}
                style={styles.image}
              />
              <View style={styles.textContainer}>
                <Text style={styles.trackTitle}>{track.filename}</Text>
                <Text style={styles.artistName}>{track.artist}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    track.filename,
                    `Artist: ${track.artist}`,
                    [{text: 'OK'}],
                    {cancelable: true}
                  );
                }}
              >
                <Image
                  source={require('@/assets/images/settings.png')}
                  style={styles.settingsIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

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
    paddingBottom: 10,
  },
  trackContainer: {
    marginBottom: 20,
    width: '100%',
  },
  trackDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  trackTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'white',
  },
  artistName: {
    color: 'white',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
});
