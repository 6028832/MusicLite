/** @format */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Button,
  View,
  Image,
  Alert,
} from 'react-native';
import {PlaylistManager} from '@/constants/PlaylistsManager';
import {MasterPlaylist} from '@/interfaces/MasterPlaylists';
import {useTheme} from '@/hooks/useTheme';
import {useContext} from 'react';
import {useMusicPlayer} from '@/components/context/AudioPlayer';
import {TracksManager} from '@/constants/TracksManager';
import Files from '@/interfaces/Files';

const placeholderImage = 'https://via.placeholder.com/100';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<MasterPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    MasterPlaylist | undefined | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showPlaylistDetails, setShowPlaylistDetails] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistSongs, setPlaylistSongs] = useState<string[]>([]);
  const [tracksInfo, setTracksInfo] = useState<Files[]>([]);
  const musicPlayer = useMusicPlayer();
  const setQueueWithPlaylist = musicPlayer?.setQueueWithPlaylist;
  const manager = new PlaylistManager();
  const tracksManager = new TracksManager();
  const theme = useTheme();
  const playTrack = musicPlayer?.playTrack;

  const fetchPlaylists = async () => {
    try {
      const fetchedPlaylist: any[] = await manager.getAllPlaylists();
      const finalPlaylists = await Promise.all(
        fetchedPlaylist.map(async (list: any) => {
          const fetchedList: string[] = await manager.getPlaylistSongs(
            list.id
          );
          return {
            ...list,
            tracksNumber: fetchedList.length,
          };
        })
      );
      setPlaylists(finalPlaylists);
    } catch (error) {
      console.error(error);
      setPlaylists([]);
      manager.firstBoot();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      const fetchPlaylistDetails = async () => {
        try {
          const songs = await manager.getPlaylistSongs(selectedPlaylist.id);
          setPlaylistSongs(songs || []);
        } catch (error) {
          console.error('Error fetching songs:', error);
          setPlaylistSongs([]);
        }
      };

      fetchPlaylistDetails();
    }
  }, [selectedPlaylist]);

  useEffect(() => {
    if (playlistSongs.length > 0) {
      const fetchTracksInfo = async () => {
        try {
          const tracks = await Promise.all(
            playlistSongs.map((songId) => tracksManager.fetchTrack(songId))
          );
          setTracksInfo(tracks);
        } catch (error) {
          console.error('Error fetching tracks info:', error);
          setTracksInfo([]);
        }
      };

      fetchTracksInfo();
    }
  }, [playlistSongs]);

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await manager.createNewplaylist(newPlaylistName, []);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
      fetchPlaylists();
    } else {
      console.error('Playlist name cannot be empty');
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    setLoading(true);
    try {
      manager.removePlaylist(playlistId);
      fetchPlaylists();
      setShowPlaylistDetails(false);
    } catch (error) {
      console.error(error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCreatePlaylist = () => (
    <View>
      <TextInput
        style={[styles.input, {color: theme.colors.text}]}
        onChangeText={setNewPlaylistName}
        value={newPlaylistName}
        placeholder="Enter playlist name"
        placeholderTextColor={theme.colors.text}
      />
      <Button
        title="Create"
        onPress={handleCreatePlaylist}
        color={theme.colors.text}
      />
      <Button
        title="Cancel"
        onPress={() => setShowCreatePlaylist(false)}
        color={theme.colors.text}
      />
    </View>
  );
  const removeTrackFromPlaylist = async (
    songId: string,
    playlistId: string
  ) => {
    await manager.removeSong(playlistId, [songId]);
  };
  const renderPlaylistDetails = () => {
    if (!selectedPlaylist) return null;
    if (loading) {
      return <Text style={[styles.loadingText, {color: theme.colors.text}]}>Loading playlist...</Text>;
    } 
 
    return (
      <View>
        <Text style={[styles.albumTitle, {color: theme.colors.text}]}>
          {selectedPlaylist.name}
        </Text>
        <TouchableOpacity>
          <Button
            title="Play all"
            onPress={() => {
              if (selectedPlaylist?.id) {
                setQueueWithPlaylist?.(selectedPlaylist.id);
                if (playTrack) {
                  playTrack(0);
                }
              }
            }}
          />
          {selectedPlaylist.name !== 'Favorites' && (
            <TouchableOpacity>
              <Button
                title="Delete"
                onPress={() => {
                  if (selectedPlaylist?.id) {
                    deletePlaylist?.(selectedPlaylist.id);
                  }
                }}
              />
            </TouchableOpacity>
          )}
          {playlistSongs.length > 0 ? (
            <ScrollView>
              {playlistSongs.map((song: string, index: number) => (
                <TouchableOpacity key={index} style={styles.trackContainer}>
                  {tracksInfo.map((item: Files, index: number) => (
                    <TouchableOpacity
                      key={index}
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
                          <Text
                            style={[
                              styles.trackTitle,
                              {color: theme.colors.text},
                            ]}
                          >
                            {item.filename || 'Unknown Title'}
                          </Text>
                          <Text
                            style={[
                              styles.artistName,
                              {color: theme.colors.text},
                            ]}
                          >
                            {item.artist || 'Unknown Artist'}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            Alert.alert(
                              'Remove Track',
                              'Are you sure you want to remove this track from the playlist?',
                              [
                                {
                                  text: 'Cancel',
                                  style: 'cancel',
                                },
                                {
                                  text: 'OK',
                                  onPress: () => {
                                    console.log(
                                      `Removing track with ID: ${item.filename} from playlist with ID: ${selectedPlaylist.name}`
                                    );
                                    removeTrackFromPlaylist(
                                      item.filename,
                                      selectedPlaylist.id
                                    );
                                  },
                                },
                              ],
                              {cancelable: false}
                            );
                          }}
                          style={styles.settingsIconContainer}
                        >
                          <Image
                            source={require('@/assets/images/settings.png')}
                            style={styles.settingsIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={[styles.text, {color: theme.colors.text}]}>
              No songs available
            </Text>
          )}
          <Button title="Back" onPress={() => setShowPlaylistDetails(false)} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPlaylists = () => (
    <ScrollView>
      <TouchableOpacity onPress={() => setShowCreatePlaylist(true)}>
        <Image source={{uri: placeholderImage}} style={styles.image} />
      </TouchableOpacity>
      {playlists.length > 0 ? (
        <View style={styles.playlistGrid}>
          {playlists.map((playlist: any) => (
            <TouchableOpacity
              key={playlist.id}
              style={styles.albumContainer}
              onPress={() => {
                setShowPlaylistDetails(true);
                setSelectedPlaylist(playlist);
                console.log('Selected playlist:', playlist.name);
              }}
            >
              <>
                <Image
                  source={{uri: playlist.imageUrl || placeholderImage}}
                  style={styles.image}
                />
                <Text style={[styles.albumTitle, {color: theme.colors.text}]}>
                  {playlist.name}
                </Text>
                <Text style={[styles.text, {color: theme.colors.text}]}>
                  {playlist.tracksNumber || 0} tracks
                </Text>
                <Text style={[styles.text, {color: theme.colors.text}]}></Text>
              </>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          No playlists available
        </Text>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      {loading ? (
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          Loading playlists...
        </Text>
      ) : showCreatePlaylist ? (
        renderCreatePlaylist()
      ) : showPlaylistDetails ? (
        renderPlaylistDetails()
      ) : (
        renderPlaylists()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: 10,
    flexDirection: 'column',
  },
  trackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  trackDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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
  image: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  artistName: {
    fontSize: 12,
    color: '#555',
  },
  imageContainer: {
    width: 50,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  playlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  settingsIconContainer: {
    width: 20,
    height: 20,
  },
});
