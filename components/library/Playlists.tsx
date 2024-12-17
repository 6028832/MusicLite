/** @format */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Button,
  View,
  Image
} from 'react-native';
import { PlaylistManager } from '@/constants/Playlists';
import { MasterPlaylist } from '@/interfaces/MasterPlaylists';
import { useTheme } from '@/hooks/useTheme';
import { ReactNode } from 'react';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<MasterPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MasterPlaylist | undefined | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showPlaylistDetails, setShowPlaylistDetails] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const manager = new PlaylistManager();
  const theme = useTheme();
  const placeholderImage = 'https://via.placeholder.com/100';
  const [playlistSongs, setPlaylistSongs] = useState<string[]>([]);


  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const fetchedPlaylist: any[] = await manager.getAllPlaylists();
      setPlaylists(fetchedPlaylist);
    } catch (error) {
      console.error(error);
      setPlaylists([]);
      manager.firstStart();
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error(error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }

  const renderCreatePlaylist = () => (
    <View>
      <TextInput
        style={[
          styles.input,
          { color: theme.colors.text },
        ]}
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

  const fetchPlaylistDetails = async (playlistId: string) => {
    try {
      const songs = await manager.getPlaylistSongs(playlistId);
      setPlaylistSongs(songs?.music || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setPlaylistSongs([]);
    }
  };

const renderPlaylistDetails = () => {
  if (!selectedPlaylist) return null;

  return (
    <View>
      <Text style={[styles.albumTitle, { color: theme.colors.text }]}>
        {selectedPlaylist.name}
      </Text>
      {playlistSongs.length > 0 ? (
        <ScrollView>
          {playlistSongs.map((song, index) => (
            <Text key={index} style={[styles.text, { color: theme.colors.text }]}>
              {song}
            </Text>
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.text, { color: theme.colors.text }]}>No songs available</Text>
      )}
      <Button title="Back" onPress={() => setShowPlaylistDetails(false)} />
    </View>
  );
};
  
  const renderPlaylists = () => (
    <ScrollView>
      <TouchableOpacity onPress={() => setShowCreatePlaylist(true)}>
        <Image source={{ uri: placeholderImage }} style={styles.image} />
      </TouchableOpacity>
      {playlists.length > 0 ? (
        <View style={styles.playlistGrid}>
          {playlists.map(playlist => (
            <TouchableOpacity
              key={playlist.id}
              style={styles.albumContainer}
              onPress={() => {
                setShowPlaylistDetails(true);
                setSelectedPlaylist(playlist);
                fetchPlaylistDetails(playlist.id);
              }}
            >
              <>
                <Image
                  source={{ uri: playlist.imageUrl || placeholderImage }}
                  style={styles.image}
                />
                <Text style={[styles.albumTitle, { color: theme.colors.text }]}>
                  {playlist.name}
                </Text>
                <Text style={[styles.text, { color: theme.colors.text }]}>
                  {playlist.tracksNumber || 0} tracks
                </Text>
              </>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          No playlists available
        </Text>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {loading ? (
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading playlists...
        </Text>
      ) : showCreatePlaylist ? (
        renderCreatePlaylist()
        ) : showPlaylistDetails ? (
          // Moet argumenten hebben, no idea what tho @redanil

          // playlist id or the playlist in question
        renderPlaylistDetails()
        ): (
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
});
