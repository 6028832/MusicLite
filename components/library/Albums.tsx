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
import {AlbumsManager} from '@/constants/AlbumsManager';
import {MasterAlbum} from '@/interfaces/MasterAlbum';
import {useTheme} from '@/hooks/useTheme';
import {useContext} from 'react';
import {useMusicPlayer} from '@/components/context/AudioPlayer';
import {TracksManager} from '@/constants/TracksManager';
import Files from '@/interfaces/Files';

const placeholderImage = 'https://via.placeholder.com/100';

export default function albums() {
  const [albums, setAlbums] = useState<MasterAlbum[]>([]);
  const [artist, setNewArtist] = useState<string>();
  const [selectedAlbum, setSelectedAlbum] = useState<
    MasterAlbum | undefined | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [showAlbumDetails, setShowAlbumDetails] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [albumSongs, setAlbumSongs] = useState<string[]>([]);
  const [tracksInfo, setTracksInfo] = useState<Files[]>([]);
  const musicPlayer = useMusicPlayer();
  const setQueueWithAlbum = musicPlayer?.setQueueWithPlaylist;
  const manager = new AlbumsManager();
  const tracksManager = new TracksManager();
  const theme = useTheme();
  const playTrack = musicPlayer?.playTrack;

  const fetchAlbums = async () => {
    try {
      const fetchedalbum: any[] = await manager.getAllAlbums();
      const finalalbums = await Promise.all(
        fetchedalbum.map(async (list: any) => {
          const fetchedList: string[] = await manager.getalbumSongs(list.id);
          return {
            ...list,
            tracksNumber: fetchedList.length,
          };
        })
      );
      setAlbums(finalalbums);
    } catch (error) {
      console.error(error);
      setAlbums([]);
      manager.firstBoot();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      const fetchalbumDetails = async () => {
        try {
          const songs = await manager.getalbumSongs(selectedAlbum.id);
          setAlbumSongs(songs || []);
        } catch (error) {
          console.error('Error fetching songs:', error);
          setAlbumSongs([]);
        }
      };

      fetchalbumDetails();
    }
  }, [selectedAlbum]);

  useEffect(() => {
    if (albumSongs.length > 0) {
      const fetchTracksInfo = async () => {
        try {
          const tracks = await Promise.all(
            albumSongs.map(songId => tracksManager.fetchTrack(songId))
          );
          setTracksInfo(tracks);
        } catch (error) {
          console.error('Error fetching tracks info:', error);
          setTracksInfo([]);
        }
      };

      fetchTracksInfo();
    }
  }, [albumSongs]);

  const handleCreateAlbum = async () => {
    if (newAlbumName.trim() && artist) {
      await manager.createNewAlbum(newAlbumName, [], artist);
      setNewAlbumName('');
      setShowCreateAlbum(false);
      fetchAlbums();
    } else {
      console.error('album name cannot be empty');
    }
  };

  const deleteAlbum = async (albumId: string) => {
    setLoading(true);
    try {
      manager.removeAlbum(albumId);
      fetchAlbums();
      setShowAlbumDetails(false);
    } catch (error) {
      console.error(error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const renderCreatealbum = () => (
    <View>
      <TextInput
        style={[styles.input, {color: theme.colors.text}]}
        onChangeText={setNewAlbumName}
        value={newAlbumName}
        placeholder="Enter Album name"
        placeholderTextColor={theme.colors.text}
      />
      <TextInput
        style={[styles.input, {color: theme.colors.text}]}
        onChangeText={setNewArtist}
        value={artist}
        placeholder="Enter Artist Name"
        placeholderTextColor={theme.colors.text}
      />
      <Button
        title="Create"
        onPress={handleCreateAlbum}
        color={theme.colors.text}
      />
      <Button
        title="Cancel"
        onPress={() => setShowCreateAlbum(false)}
        color={theme.colors.text}
      />
    </View>
  );
  const removeTrackFromalbum = async (songId: string, albumId: string) => {
    await manager.removeSong(albumId, [songId]);
  };
  const renderalbumDetails = () => {
    if (!selectedAlbum) return null;
    if (loading) {
      return (
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          Loading album...
        </Text>
      );
    }

    return (
      <View>
        <Text style={[styles.albumTitle, {color: theme.colors.text}]}>
          {selectedAlbum.name}
        </Text>
        <TouchableOpacity>
          <Button
            title="Play all"
            onPress={() => {
              if (selectedAlbum?.id) {
                setQueueWithAlbum?.(selectedAlbum.id);
                if (playTrack) {
                  playTrack(0);
                }
              }
            }}
          />
          {selectedAlbum.name !== 'Favorites' && (
            <TouchableOpacity>
              <Button
                title="Delete"
                onPress={() => {
                  if (selectedAlbum?.id) {
                    deleteAlbum?.(selectedAlbum.id);
                  }
                }}
              />
            </TouchableOpacity>
          )}
          {albumSongs.length > 0 ? (
            <ScrollView>
              {albumSongs.map((song: string, index: number) => (
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
                              'Are you sure you want to remove this track from the album?',
                              [
                                {
                                  text: 'Cancel',
                                  style: 'cancel',
                                },
                                {
                                  text: 'OK',
                                  onPress: () => {
                                    console.log(
                                      `Removing track with ID: ${item.filename} from album with ID: ${selectedAlbum.name}`
                                    );
                                    removeTrackFromalbum(
                                      item.filename,
                                      selectedAlbum.id
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
          <Button title="Back" onPress={() => setShowAlbumDetails(false)} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderalbums = () => (
    <ScrollView>
      <TouchableOpacity onPress={() => setShowCreateAlbum(true)}>
        <Image source={{uri: placeholderImage}} style={styles.image} />
      </TouchableOpacity>
      {albums.length > 0 ? (
        <View style={styles.albumGrid}>
          {albums.map((album: any) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumContainer}
              onPress={() => {
                setShowAlbumDetails(true);
                setSelectedAlbum(album);
                console.log('Selected album:', album.name);
              }}
            >
              <>
                <Image
                  source={{uri: album.imageUrl || placeholderImage}}
                  style={styles.image}
                />
                <Text style={[styles.albumTitle, {color: theme.colors.text}]}>
                  {album.name}
                </Text>
                <Text style={[styles.text, {color: theme.colors.text}]}>
                  {album.tracksNumber || 0} tracks
                </Text>
                <Text style={[styles.text, {color: theme.colors.text}]}></Text>
              </>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={[styles.loadingText, {color: theme.colors.text}]}>
          No albums available
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
          Loading albums...
        </Text>
      ) : showCreateAlbum ? (
        renderCreatealbum()
      ) : showAlbumDetails ? (
        renderalbumDetails()
      ) : (
        renderalbums()
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
  albumGrid: {
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
