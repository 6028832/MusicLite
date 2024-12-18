/** @format */

import React, {createContext, useState, useContext, useEffect} from 'react';
import {Audio} from 'expo-av';
import Files from '@/interfaces/Files';
import {MusicPlayerContextInterface} from '@/interfaces/MusicPlayerContext';
import {PlaylistManager} from '@/constants/Playlists';
import {TracksManager} from '@/constants/TracksManager';
const MusicPlayerContext = createContext<
  MusicPlayerContextInterface | undefined
>(undefined);

export const MusicPlayerProvider = ({children}: any) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [queue, setQueue] = useState<Files[]>([]);
  const manager = new PlaylistManager();
  const tracksManager = new TracksManager();

  const playTrack = async (trackIndex: number) => {
    const track = queue[trackIndex];
    if (!track) {
      return;
    }

    if (sound) {
      await sound.unloadAsync();
    }

    if (!track.uri) {
      return;
    }
    const {sound: newSound} = await Audio.Sound.createAsync({uri: track.uri});
    setSound(newSound);
    setCurrentTrackIndex(trackIndex);
    setIsPlaying(true);
  };

  const togglePlayback = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const skipTrack = async () => {
    if (queue.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % queue.length;
      await playTrack(nextIndex);
    }
  };

  const previousTrack = async () => {
    if (queue.length > 0) {
      const prevIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
      await playTrack(prevIndex);
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const setQueueWithPlaylist = async (playlistId: string) => {
    if (playlistId) {
      const playlistTracks: string[] = await manager.getPlaylistSongs(playlistId);
      const tracks: Files[] = await Promise.all(
        playlistTracks.map(async (track: string) => await tracksManager.fetchTrack(track))
      );
      setQueue(tracks);
    } else {
      const allTracks = await tracksManager.getAudioFiles();
      setQueue(allTracks);
    }
  };

  const shuffleQueue = () => {
    setQueue(prevQueue => {
      const shuffledQueue = [...prevQueue];
      for (let i = shuffledQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQueue[i], shuffledQueue[j]] = [
          shuffledQueue[j],
          shuffledQueue[i],
        ];
      }
      return shuffledQueue;
    });
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        shuffleQueue,
        queue,
        currentTrackIndex,
        currentTrack: queue[currentTrackIndex],
        setQueue,
        playTrack: (trackIndex: number) => playTrack(trackIndex),
        skipTrack,
        previousTrack,
        togglePlayback,
        stopPlayback,
        isPlaying,
        setQueueWithPlaylist,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextInterface | undefined => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
// Playlist page
// + add playknop
// playknop stuur playlist id naar de audioplayer

// Audioplayer

// Als je audio in de queue will zetten
// Check of er een playlist id is mee gegeven
// nee = normale songs uit je hele lijst

// ja = fetch alle songs van de playlist.
