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
  FlatList,
  Modal,
} from 'react-native';
import {useMusicPlayer} from '@/components/context/AudioPlayer';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '@/hooks/useTheme';
import Files from '@/interfaces/Files';
import {PlaylistManager} from '@/constants/Playlists';
import {MasterPlaylist} from '@/interfaces/MasterPlaylists';
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
  const manager = new PlaylistManager();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showPlaylistsPopup, setShowPlaylistsPopup] = useState(false);
  const placeholderImage = 'https://via.placeholder.com/100';

  interface PlaylistPopupProps {
    isVisible: boolean;
    onClose: () => void;
    playlists: any[];
    track: string;
  }
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


  const addToPlaylist = async (playlistId: string, track: string) => {
    // tracks could possible become :string[] later, or in another function
    await manager.addToplaylist(playlistId, [track]);
    setShowPlaylistsPopup(false);
  };
  useEffect(() => {
    const fetchPlaylists = async () => {
      const playlistsData = await manager.getAllPlaylists();
      setPlaylists(playlistsData);
    };
    fetchPlaylists();
  }, []);

  const PlaylistPopup: React.FC<PlaylistPopupProps> = ({
    isVisible,
    onClose,
    playlists,
    track,
  }) => {
    if (!isVisible) return null;

    return (
      <Modal visible={isVisible} transparent={true} animationType="slide">
        <View style={[styles.modalContainer, {backgroundColor: theme.colors.blackBackground}]}>

          <View style={[styles.modalContent, {backgroundColor: theme.colors.background}]}>
          <View style={styles.playlistItem}>
            <Text style={[styles.playlistTitle, {color: theme.colors.text}]}>Save to Playlist</Text>
            <TouchableOpacity
              onPress={() => setShowPlaylistsPopup(false)}
            >
              <Text style={[{color: theme.colors.text}]}>Close</Text>
            </TouchableOpacity>
          </View>
            <Text style={[styles.playlistSubTitle, {color: theme.colors.text}]}>All Playlists</Text>
            <ScrollView>
              {playlists.map(playlist => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistItem}
                  onPress={() => addToPlaylist(playlist.id, track)}
                >
                  <Image source={playlist.imageUrl}></Image>
                  <Text style={[styles.artistName, {color: theme.colors.text}]}>
                    {playlist.name}
                  </Text>
                  <Text style={[styles.artistName, {color: theme.colors.text}]}>
                    {playlist.tracksNumber || 0} Tracks
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTrack = ({item, index}: {item: Files; index: number}) => (
    <TouchableOpacity
      style={styles.trackContainer}
      onPress={() => playTrack && playTrack(index)}
    >
      <View style={styles.trackDetails}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: item.imageUrl || placeholderImage}}
            style={styles.image}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.trackTitle, {color: theme.colors.text}]}>
            {item.filename || 'Unknown Title'}
          </Text>
          <Text style={[styles.artistName, {color: theme.colors.text}]}>
            {item.artist || 'Unknown Artist'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowPlaylistsPopup(true)}
          style={styles.settingsIconContainer}
        >
          <Image
            source={require('@/assets/images/settings.png')}
            style={styles.settingsIcon}
          />
        </TouchableOpacity>
      </View>

      {showPlaylistsPopup && (
        <PlaylistPopup
          isVisible={showPlaylistsPopup}
          onClose={() => setShowPlaylistsPopup(false)}
          playlists={playlists}
          track={item.uri}
        />
      )}
    </TouchableOpacity>
  );

  return loading ? (
    <Text style={styles.loadingText}>Loading tracks...</Text>
  ) : (
    <View style={styles.container}>
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  artistName: {
    fontSize: 12,
    color: '#555',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  trackDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  imageContainer: {
    width: 50,
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },

  settingsIconContainer: {
    width: 20,
    height: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  playListItems: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  playlistSubTitle: {
    fontSize: 16,
    marginVertical: 10,
  },
});
