/** @format */

import React, {createContext, useState, useContext} from 'react';
import {Audio} from 'expo-av';
import Files from '@/interfaces/Files';
import {MusicPlayerContextInterface} from '@/interfaces/MusicPlayerContext';

const MusicPlayerContext = createContext<
  MusicPlayerContextInterface | undefined
>(undefined);

export const MusicPlayerProvider = ({children}: any) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [queue, setQueue] = useState<Files[]>([]);

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

  const shuffleQueue = () => {
    setQueue([...queue].sort(() => Math.random() - 0.5));
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        queue,
        currentTrackIndex,
        currentTrack: queue[currentTrackIndex],
        setQueue,
        playTrack: (trackIndex: number) => playTrack(trackIndex),
        skipTrack,
        previousTrack,
        shuffleQueue,
        togglePlayback,
        stopPlayback,
        isPlaying
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
  return {
    ...context,
    setQueue: context.setQueue, // Ensure you expose setQueue
  };
};
