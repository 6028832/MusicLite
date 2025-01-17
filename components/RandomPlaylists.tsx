/** @format */

import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Files from '@/interfaces/Files';
import {MasterPlaylist} from '@/interfaces/MasterPlaylists';
import {PlaylistManager} from '@/constants/PlaylistsManager';

export default function RandomPlaylists() {
  const [randomTracks, setRandomTracks] = useState<MasterPlaylist[]>([]);
  const manager = new PlaylistManager();
  const placeholderImage = 'https://via.placeholder.com/100';

  const fetchTracks = async () => {
    let storedPlaylists: MasterPlaylist[] = await manager.getAllPlaylists();
    let playlistsToAdd: MasterPlaylist[] = [];
    let amount = 9;
    if (storedPlaylists.length < 9) {
      amount = storedPlaylists.length;
    }
    for (let i = 0; i < amount; i++) {
      const randomIndex = Math.round(Math.random() * storedPlaylists.length);
      playlistsToAdd.push(storedPlaylists[randomIndex]);
      storedPlaylists.splice(randomIndex);
    }
    setRandomTracks(playlistsToAdd);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const renderTrackItem = ({item}: {item: MasterPlaylist}) => (
    <View style={styles.trackItem}>
      <Image
        source={{uri: item.imageUrl || placeholderImage}}
        style={styles.image}
      />
      <View style={styles.trackDetails}>
        <Text style={styles.trackTitle}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={randomTracks}
      keyExtractor={item => item.id.toString()}
      renderItem={renderTrackItem}
      contentContainerStyle={styles.container}
      horizontal={true} // Ensure the list is vertical
    />
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
  },
  trackItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#bbb',
    fontSize: 14,
  },
});
