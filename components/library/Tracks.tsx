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
import {PlaylistManager} from '@/constants/PlaylistsManager';
import {TracksManager} from '@/constants/TracksManager';
import { AlbumsManager } from '@/constants/AlbumsManager';
const GeniusAPI_BASE_URL = 'https://api.genius.com';

export const getApiCode = async () => {
  const apiCode = (await AsyncStorage.getItem('apiCode')) || '';
  console.log('Fetched API code from AsyncStorage:', apiCode);
  return apiCode;
};

export default function Tracks() {
  const [tracks, setTracks] = useState<Files[]>([]);
  const [loading, setLoading] = useState(false);
  const [geniusAccessToken, setGeniusAccessToken] = useState<string>('');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [showPlaylistsPopup, setShowPlaylistsPopup] = useState(false);
  const [showAlbumsPopup, setShowAlbumsPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const musicPlayer = useMusicPlayer();
  const theme = useTheme();
  const playTrack = musicPlayer?.playTrack;
  const manager = new PlaylistManager();
  const albumsManager = new AlbumsManager();
  const tracksManager = new TracksManager();
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
      return {
        artist: 'Unknown Artist',
        imageUrl: 'https://via.placeholder.com/100',
      };
    }
  };

  const getTracksFromLibrary = async () => {
    setLoading(true);
    console.log('Accessing media library...');
    try {
      const storedTracks = await AsyncStorage.getItem('savedTracks');
      if (storedTracks) {
        const parsedTracks = JSON.parse(storedTracks);
        setTracks(parsedTracks);
        if (musicPlayer) {
          musicPlayer.setQueue(parsedTracks);
        }
        console.log('Loaded tracks from AsyncStorage');
        setLoading(false);
        return;
      }

      tracksManager.firstBoot();
      let assets: Files[] = await tracksManager.getAudioFiles();

      console.log(`Found ${assets.length} audio files in library.`);

      let fetchAmount: number = 0;
      let skipAmount: number = 0;
      const tracksWithInfo: Files[] = await Promise.all(
        assets.map(async asset => {
          if (asset.imageUrl == '' || asset.imageUrl == undefined) {
            let trackTitle = '';
            let artist = '';
            let name = asset.filename;

            const match = asset.filename.match(/(.*?)(?:\s*\((.*?)\))?\.mp3/);

            if (match) {
              trackTitle = match[1].trim();
              artist = match[2] ? match[2].trim() : '';
            } else {
              const parts = asset.filename
                .split(' - ')
                .map(part => part.trim());
              trackTitle = parts[0];
              artist = parts[1] || '';
            }

            // Apply search-like behavior here
            const trackInfo = await fetchTrackInfo(trackTitle, artist);
            await tracksManager.saveSong(name, {
              albumId: asset.albumId ?? 0,
              creationTime: asset.creationTime ?? 0,
              duration: asset.duration ?? 'No data on duration',
              filename: asset.filename ?? 'Unknown audio file',
              height: asset.height ?? 0,
              id: asset.id ?? 0,
              mediaType: 'audio',
              modificationTime: asset.modificationTime ?? 0,
              uri: asset.uri,
              width: asset.width ?? 0,
              imageUrl: trackInfo.imageUrl ?? 'https://via.placeholder.com/100',
              artist: trackInfo.artist ?? 'Unknown Artist',
            });
            fetchAmount++;
            return {...asset, ...trackInfo};
          } else {
            skipAmount++;
            return {...asset};
          }
        })
      );

      console.log(
        `fetched ${tracksWithInfo.length} track(s). ${fetchAmount} track(s) fetched and ${skipAmount} track(s) skipped`
      );
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

  const addToPlaylist = async (playlistId: string, track: string) => {
    // tracks could possible become :string[] later, or in another function
    await manager.addToPlaylist(playlistId, [track]);
    setShowPlaylistsPopup(false);
  };

    const addToAlbums = async (albumId: string, track: string) => {
      // tracks could possible become :string[] later, or in another function
      await albumsManager.addToAlbum(albumId, [track]);
      setShowAlbumsPopup(false);
  };
  
  useEffect(() => {
    const fetchPlaylists = async () => {
      const playlistsData = await manager.getAllPlaylists();
      setPlaylists(playlistsData);
    };
    fetchPlaylists();
  }, []);

    useEffect(() => {
      const fetchAlbums = async () => {
        const albumsData = await albumsManager.getAllAlbums();
        setAlbums(albumsData);
      };
      fetchAlbums();
    }, []);
  
  const SettingsPopup: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    onSelect: (option: string) => void;
  }> = ({isVisible, onClose, onSelect}) => {
    if (!isVisible) return null;

    return (
      <Modal visible={isVisible} transparent={true} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            {backgroundColor: theme.colors.blackBackground},
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {backgroundColor: theme.colors.background},
            ]}
          >
            <Text style={[styles.modalTitle, {color: theme.colors.text}]}>
              Options
            </Text>
            <TouchableOpacity onPress={() => onSelect('playlist')}>
              <Text style={[styles.optionText, {color: theme.colors.text}]}>
                Open Playlist
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelect('album')}>
              <Text style={[styles.optionText, {color: theme.colors.text}]}>
                Open Album
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, {color: theme.colors.text}]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

    const handleCreateAlbum = async (track: Files) => {
      const albumName = track.filename.split(' - ')[0];
      const artist = track.artist || 'Unknown Artist';
      await albumsManager.createNewAlbum(albumName, [track.filename], artist);
      setShowAlbumsPopup(false);
      Alert.alert('Album Created', `Album "${albumName}" by ${artist} created.`);
    };

    const PlaylistOrAlbumPopup: React.FC<{
      isVisible: boolean;
      onClose: () => void;
      playlists: any[];
      albums: any[];
      track: Files;
      type: 'playlist' | 'album';
    }> = ({isVisible, onClose, playlists, albums, track, type}) => {
      if (!isVisible) return null;

      const items = type === 'playlist' ? playlists : albums;
      const addTo = type === 'playlist' ? addToPlaylist : addToAlbums;

      return (
        <Modal visible={isVisible} transparent={true} animationType="slide">
          <View
            style={[
              styles.modalContainer,
              {backgroundColor: theme.colors.blackBackground},
            ]}
          >
            <View
              style={[
                styles.modalContent,
                {backgroundColor: theme.colors.background},
              ]}
            >
              <View style={styles.playlistItem}>
                <Text style={[styles.playlistTitle, {color: theme.colors.text}]}>
                  Save to {type === 'playlist' ? 'Playlist' : 'Album'}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={[{color: theme.colors.text}]}>Close</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.playlistSubTitle, {color: theme.colors.text}]}>
                All {type === 'playlist' ? 'Playlists' : 'Albums'}
              </Text>
              <ScrollView>
                {items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.playlistItem}
                    onPress={() => addTo(item.id, track.filename)}
                  >
                    <Image source={{uri: item.imageUrl || placeholderImage}} style={styles.image} />
                    <Text style={[styles.artistName, {color: theme.colors.text}]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.artistName, {color: theme.colors.text}]}>
                      {item.tracksNumber || 0} Tracks
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {type === 'album' && (
                <TouchableOpacity
                  style={styles.createAlbumButton}
                  onPress={() => handleCreateAlbum(track)}
                >
                  <Text style={[styles.button, {color: theme.colors.text}]}>
                    Create New Album
                  </Text>
                </TouchableOpacity>
              )}
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
        onPress={() => setShowSettingsPopup(true)}
        style={styles.settingsIconContainer}
      >
        <Image
          source={require('@/assets/images/settings.png')}
          style={styles.settingsIcon}
        />
      </TouchableOpacity>
    </View>

    {showSettingsPopup && (
      <SettingsPopup
        isVisible={showSettingsPopup}
        onClose={() => setShowSettingsPopup(false)}
        onSelect={option => {
          setShowSettingsPopup(false);
          if (option === 'playlist') {
            setShowPlaylistsPopup(true);
          } else if (option === 'album') {
            setShowAlbumsPopup(true);
          } else if (option === 'sleeptime') {
            console.log('Show lyrics');
          }
        }}
      />
    )}
    {showPlaylistsPopup && (
      <PlaylistOrAlbumPopup
        isVisible={showPlaylistsPopup}
        onClose={() => setShowPlaylistsPopup(false)}
        playlists={playlists}
        albums={[]}
        track={item}
        type="playlist"
      />
    )}
    {showAlbumsPopup && (
      <PlaylistOrAlbumPopup
        isVisible={showAlbumsPopup}
        onClose={() => setShowAlbumsPopup(false)}
        playlists={[]}
        albums={albums}
        track={item}
        type="album"
      />
    )}
  </TouchableOpacity>
);

  return loading ? (
    <Text style={styles.loadingText}>Loading tracks...</Text>
  ) : (
      <View style={styles.container}>
      <Text style={[styles.playlistTitle, {color: theme.colors.text}]}>
          | Tracks
        </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => musicPlayer?.playTrack(0)}
        >
          <Text style={[styles.button, {color: theme.colors.text}]}>
            Play All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => musicPlayer?.shuffleQueue()}
        >
          <Text style={[styles.button, {color: theme.colors.text}]}>
            Shuffle
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 5,
    paddingBottom: 50,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
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
