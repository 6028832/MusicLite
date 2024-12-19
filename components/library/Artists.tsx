/** @format */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useMusicPlayer } from '@/components/context/AudioPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import Files from '@/interfaces/Files';
import { PlaylistManager } from '@/constants/PlaylistsManager';
import { TracksManager } from '@/constants/TracksManager';
import { AlbumsManager } from '@/constants/AlbumsManager';
const GeniusAPI_BASE_URL = 'https://api.genius.com';

export const getApiCode = async () => {
  const apiCode = (await AsyncStorage.getItem('apiCode')) || '';
  console.log('Fetched API code from AsyncStorage:', apiCode);
  return apiCode;
};

export default function Artists() {
  const [tracks, setTracks] = useState<Files[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredTracks, setFilteredTracks] = useState<Files[]>([]);
  const musicPlayer = useMusicPlayer();
  const theme = useTheme();
  const [geniusAccessToken, setGeniusAccessToken] = useState<string>('');
  const playTrack = musicPlayer?.playTrack;
  const manager = new PlaylistManager();
  const tracksManager = new TracksManager();
  const albumsManager = new AlbumsManager(); // Initialize AlbumsManager
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showPlaylistsPopup, setShowPlaylistsPopup] = useState(false);
  const [albums, setAlbums] = useState<any[]>([]); // State to store albums
  const placeholderImage = 'https://via.placeholder.com/100';

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
        setFilteredTracks(parsedTracks);
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
        assets.map(async (asset) => {
          if (asset.imageUrl == '' || asset.imageUrl == undefined) {
            let trackTitle = '';
            let artist = '';
            let name = asset.filename;

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
            return { ...asset, ...trackInfo };
          } else {
            skipAmount++;
            return { ...asset };
          }
        })
      );

      console.log(
        `fetched ${tracksWithInfo.length} track(s). ${fetchAmount} track(s) fetched and ${skipAmount} track(s) skipped`
      );
      setTracks(tracksWithInfo);
      setFilteredTracks(tracksWithInfo); // Set filtered tracks when fetching new ones
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

  const fetchAlbumsByArtist = async (artistName: string) => {
    try {
      const allAlbums = await albumsManager.getAllAlbums();
      const artistAlbums = allAlbums.filter((album: any) => album.artist === artistName);
      setAlbums(artistAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
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

  // Add filtering functionality
  const filterByArtist = (artistName: string) => {
    const filtered = tracks.filter((track) => track.artist === artistName);
    setFilteredTracks(filtered);
    fetchAlbumsByArtist(artistName); // Fetch albums by artist
  };

  const addToPlaylist = async (playlistId: string, track: string) => {
    await manager.addToPlaylist(playlistId, [track]);
    setShowPlaylistsPopup(false);
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      const playlistsData = await manager.getAllPlaylists();
      setPlaylists(playlistsData);
    };
    fetchPlaylists();
  }, []);

  interface PlaylistPopupProps {
    isVisible: boolean;
    onClose: () => void;
    playlists: any[];
    track: string;
  }

  const PlaylistPopup: React.FC<PlaylistPopupProps> = ({
    isVisible,
    onClose,
    playlists,
    track,
  }) => {
    if (!isVisible) return null;

    return (
      <Modal visible={isVisible} transparent={true} animationType="slide">
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.blackBackground },
          ]}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.colors.background }]}
          >
            <View style={styles.playlistItem}>
              <Text style={[styles.playlistTitle, { color: theme.colors.text }]}>
                Save to Playlist
              </Text>
              <TouchableOpacity onPress={() => setShowPlaylistsPopup(false)}>
                <Text style={[{ color: theme.colors.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.playlistSubTitle, { color: theme.colors.text }]}>
              All Playlists
            </Text>
            <ScrollView>
              {Object.keys(groupedTracks).map((artist) => (
                <View key={artist}>
                  <Text style={[styles.artistName, { color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginVertical: 10 }]}>
                    {artist}
                  </Text>
                  {albums.map((album) => renderAlbum(album))}
                  {groupedTracks[artist].map((track, index) => (
                    <View key={track.id}>
                      {renderTrack({ item: track, index })}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistItem}
                  onPress={() => addToPlaylist(playlist.id, track)}
                >
                  <Image source={playlist.imageUrl}></Image>
                  <Text style={[styles.artistName, { color: theme.colors.text }]}>
                    {playlist.name}
                  </Text>
                  <Text style={[styles.artistName, { color: theme.colors.text }]}>
                    {playlist.tracksNumber || 0} Tracks
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
      </Modal>
    );
  };

  const renderTrack = ({ item, index }: { item: Files; index: number }) => (
    <TouchableOpacity
      style={styles.trackContainer}
      onPress={() => playTrack && playTrack(index)}
    >
      <View style={styles.trackDetails}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl || placeholderImage }}
            style={styles.image}
          />
        </View>

          <View style={styles.textContainer}>
            <Text style={[styles.trackTitle, { color: theme.colors.text }]}>
              {item.filename || 'Unknown Title'}
            </Text>
            <Text style={[styles.artistName, { color: theme.colors.text }]}>
              {item.artist || 'Unknown Artist'}
            </Text>
          </View>
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
      
      {showPlaylistsPopup && (
        <PlaylistPopup
          isVisible={showPlaylistsPopup}
          onClose={() => setShowPlaylistsPopup(false)}
          playlists={playlists}
          track={item.filename}
        />
      )}
    </TouchableOpacity>
  );

  const renderAlbum = (album: any) => (
    <TouchableOpacity
      key={album.id}
      style={styles.albumContainer}
      onPress={() => {
        // Handle album click
      }}
    >
      <Image
        source={{ uri: album.imageUrl || placeholderImage }}
        style={styles.image}
      />
      <Text style={[styles.albumTitle, { color: theme.colors.text }]}>
        {album.name}
      </Text>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {album.tracksNumber || 0} tracks
      </Text>
    </TouchableOpacity>
  );

  const groupedTracks = filteredTracks.reduce((acc, track) => {
    if (!acc[track.artist]) {
      acc[track.artist] = [];
    }
    acc[track.artist].push(track);
    return acc;
  }, {} as Record<string, Files[]>);

  return loading ? (
    <Text style={styles.loadingText}>Loading tracks...</Text>
  ) : (
    <View style={styles.container}>
      <ScrollView>
        {Object.keys(groupedTracks).map((artist) => (
          <View key={artist}>
            <Text style={[styles.artistName, { color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginVertical: 10 }]}>
              {artist}
            </Text>
            {albums.map((album) => renderAlbum(album))}
            {groupedTracks[artist].map((track, index) => (
              <View key={track.id}>
                {renderTrack({ item: track, index })}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  artistFilterContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  artistFilter: {
    marginRight: 10,
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#ff9900',
  },
  artistFilterText: {
    color: 'white',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: '50%',
  },
  trackContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  trackDetails: {
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    marginRight: 15,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 14,
  },
  settingsIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  playlistSubTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  albumContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    width: '48%',
  },
  albumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
