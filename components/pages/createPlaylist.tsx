import { PlaylistManager } from '@/constants/Playlists';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, Text, Button} from 'react-native';
import { useState, useEffect } from 'react';

export default function CreatePlaylist(): any {
    const [playlistName, setPlaylistName] = useState<String>();    
    const manager = new PlaylistManager();
    
    function createPlaylist(){
        manager.createNewplaylist(playlistName, [''])
    }
    

    return (
        <SafeAreaView style={styles.container}>
            <TextInput
            onChangeText={setPlaylistName}
            />

            <Button
            title='create'
            onPress={() => createPlaylist()}
            
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
});
