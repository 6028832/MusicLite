/** @format */

import {PlaylistManager} from '@/constants/Playlists';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useState, useEffect} from 'react';
import {MasterPlaylist} from '@/interfaces/MasterPlaylists';
import CreatePlaylist from '@/components/createPlaylist';

export default function Playlists(): any {
  const [playlists, setPlaylists] = useState<MasterPlaylist[]>([]); // Ensure it's initialized as an empty array
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const manager = new PlaylistManager();

  useEffect(() => {
    // Fetch the playlists
    const fetchPlaylists = async () => {
      try {
        const fetchedPlaylist: MasterPlaylist[] =
          await manager.getAllPlaylists();
        setPlaylists(fetchedPlaylist); // Ensure playlists is set as an array
      } catch (error) {
        console.error(error);
        setPlaylists([]); // Set to an empty array on error
        manager.firstStart(); // Initialize with an empty playlist if fetching fails
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []); // Empty dependency array ensures it only runs once on component mount

  const handleCreatePlaylist = async () => {
    const name = '';
    const music = [''];

    await manager.createNewplaylist(name, music);
    const updatedPlaylists = await manager.getAllPlaylists();
    setPlaylists(updatedPlaylists); // Update playlists after creation
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => CreatePlaylist()}>
        <Text>Create New Playlist</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loadingText}>Loading playlists...</Text>
      ) : (
        <ScrollView>
          {playlists.length > 0 ? (
            playlists.map(playlist => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.albumContainer}
                onPress={() => setSelectedAlbum(playlist)}
              >
                <Text style={styles.albumTitle}>{playlist.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.loadingText}>No playlists available</Text> // Display message when no playlists are available
          )}
        </ScrollView>
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
    color: '#666',
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
});
