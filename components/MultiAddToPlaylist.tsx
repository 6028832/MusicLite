import { PlaylistManager } from '@/constants/Playlists';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, Text, Button} from 'react-native';
import { useState, useEffect } from 'react';
import { MasterPlaylist } from '@/interfaces/MasterPlaylists';
import { useTheme } from '@react-navigation/native';

export default function CreatePlaylist(): any {
    const [playlistName, setPlaylistName] = useState<MasterPlaylist | undefined | string>();    
    const manager = new PlaylistManager();
    const theme = useTheme();
    function createPlaylist(){
        if (typeof playlistName === 'string') {
            manager.createNewplaylist(playlistName, []);
        } else {
            console.error('Playlist name must be a string');
        }
    }
    

    return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      <TextInput
        style={[
        {color: theme.colors.text, borderColor: 'white'},
        styles.text,
        ]}
        onChangeText={setPlaylistName}
        placeholder="Enter playlist name"
        placeholderTextColor={theme.colors.text}
      />

      <Button
        title="Create"
        onPress={() => createPlaylist()}
        color={theme.colors.primary}
      />

      <Button
        title="Go Back"
        onPress={() => console.log('Go back pressed')}
        color={theme.colors.primary}
      />
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
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
