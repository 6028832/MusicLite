/** @format */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {PlaylistManager} from '@/constants/PlaylistsManager';
import {AlbumsManager} from '@/constants/AlbumsManager';
import {TracksManager} from '@/constants/TracksManager';
export default function Home() {
  const playlistManager = new PlaylistManager();
  const albumsManager = new AlbumsManager();
  const tracksManager = new TracksManager();

  playlistManager.firstBoot();
  tracksManager.firstBoot();
  albumsManager.firstBoot();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Albums</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  albumCard: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 10,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
