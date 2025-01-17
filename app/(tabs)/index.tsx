/** @format */

/** @format */

import React, {useState, useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import RandomTracks from '@/components/RandomTracks';
import RandomPlaylists from '@/components/RandomPlaylists';
import {useTheme} from '@react-navigation/native';
import {TracksManager} from '@/constants/TracksManager';
import {PlaylistManager} from '@/constants/PlaylistsManager';
import {AlbumsManager} from '@/constants/AlbumsManager';
export default function Home() {
  const startUp = async () => {
    const forced: boolean = false;
    const tracksManager = new TracksManager();
    const playlistManager = new PlaylistManager();
    const albumsManager = new AlbumsManager();

    await tracksManager.firstBoot(forced);
    await playlistManager.firstBoot(forced);
    await albumsManager.firstBoot(forced);
  };

  useEffect(() => {
    const runStartup = async () => {
      console.log('lmao');
      await startUp();
    };

    runStartup();
  });

  const theme = useTheme();
  return (
    <>
      <Text style={[styles.title, {color: theme.colors.text}]}>
        Featured Tracks
      </Text>
      <RandomTracks />
      <Text style={[styles.title, {color: theme.colors.text}]}>
        Random Picks
      </Text>
      <RandomPlaylists />
      {/* <Text style={[styles.title, { color: theme.colors.text }]}>
        Music to relax to
      </Text>

      <RandomTracks />
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Random picks part 2 electric boogaloo
      </Text>

      <RandomTracks /> */}
    </>
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
