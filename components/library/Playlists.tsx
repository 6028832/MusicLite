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
} from 'react-native';
import {PlaylistManager} from '@/constants/Playlists';
import {MasterPlaylist} from '@/interfaces/MasterPlaylists';
import {useTheme} from '@/hooks/useTheme';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<MasterPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MasterPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const manager = new PlaylistManager();
  const theme = useTheme();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const fetchedPlaylist: MasterPlaylist[] = await manager.getAllPlaylists();
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
      await manager.createNewplaylist(newPlaylistName, ['']);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
      fetchPlaylists();
    } else {
      console.error('Playlist name cannot be empty');
    }
  };

  const renderCreatePlaylist = () => (
    <View>
      <TextInput
        style={[
          styles.input,
          {color: theme.colors.text, borderColor: theme.colors.border},
        ]}
        onChangeText={setNewPlaylistName}
        value={newPlaylistName}
        placeholder="Enter playlist name"
        placeholderTextColor={theme.colors.text}
      />
      <Button
        title="Create"
        onPress={handleCreatePlaylist}
        color={theme.colors.primary}
      />
      <Button
        title="Cancel"
        onPress={() => setShowCreatePlaylist(false)}
        color={theme.colors.primary}
      />
    </View>
  );

  const renderPlaylists = () => (
    <ScrollView>
      <TouchableOpacity onPress={() => setShowCreatePlaylist(true)}>
        <Text style={[styles.text, {color: theme.colors.text}]}>
          Create New Playlist
        </Text>
      </TouchableOpacity>
      {playlists.length > 0 ? (
        playlists.map(playlist => (
          <TouchableOpacity
            key={playlist.id}
            style={styles.albumContainer}
            onPress={() => setSelectedPlaylist(playlist)}
          >
            <Text style={[styles.albumTitle]}>
              {playlist.name}
            </Text>
          </TouchableOpacity>
        ))
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
      ) : (
        renderPlaylists()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  albumContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  albumTitle: {
    fontSize: 18,
      fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
