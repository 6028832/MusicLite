/** @format */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import {useMusicPlayer} from '@/components/context/AudioPlayer';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/hooks/useTheme';
import Files from '@/interfaces/Files';

const GeniusAPI_BASE_URL = 'https://api.genius.com';

export const getApiCode = async () => {
  const apiCode = (await AsyncStorage.getItem('apiCode')) || '';
  console.log('Fetched API code from AsyncStorage:', apiCode);
  return apiCode;
};

export default function Tracks() {
  const [tracks, setTracks] = useState<Files[]>([]);
  const [loading, setLoading] = useState(false);
  const musicPlayer = useMusicPlayer();
  const theme = useTheme();
  const [geniusAccessToken, setGeniusAccessToken] = useState<string>('');
  const playTrack = musicPlayer?.playTrack;

  const shuffleQueue = () => {
    const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
    if (musicPlayer) {
      musicPlayer.setQueue(shuffledTracks);
      musicPlayer.currentTrackIndex = 0; // Reset to the first track in the shuffled queue
      if (musicPlayer?.stopPlayback) {
        musicPlayer.stopPlayback();
      }
      if (musicPlayer?.togglePlayback) {
        musicPlayer.togglePlayback();
      }
      setTimeout(() => {
        playTrack && playTrack(0); // Play the first track in the shuffled queue
      }, 1000); // Adding a slight delay to ensure the pause action is completed
    }
  };

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
      await AsyncStorage.setItem('savedTracks', JSON.stringify(tracksWithInfo));
      if (musicPlayer) {
        musicPlayer.setQueue(tracksWithInfo);
      }
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

  const renderTrack = ({item, index}: {item: Files; index: number}) => (
    <TouchableOpacity
      style={styles.trackContainer}
      onPress={() => playTrack && playTrack(index)}
    >
      <View style={styles.trackDetails}>
        <Image
          source={{uri: item.imageUrl || placeholderImage}}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.trackTitle, {color: theme.colors.text}]}>
            {item.filename || 'Unknown Title'}
          </Text>
          <Text style={[styles.artistName, {color: theme.colors.text}]}>
            {item.artist || 'Unknown Artist'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              item.filename || 'Track Info',
              `Artist: ${item.artist || 'Unknown'}`,
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
  );

  return loading ? (
    <Text style={styles.loadingText}>Loading tracks...</Text>
  ) : (
    <View style={styles.container}>
      <TouchableOpacity onPress={shuffleQueue} style={styles.shuffleButton}>
        <Text style={styles.shuffleButtonText}>Shuffle Queue</Text>
      </TouchableOpacity>
      <FlatList
        data={tracks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderTrack}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 10,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  artistName: {
    fontSize: 14,
    color: '#555',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
  },
  shuffleButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  shuffleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
