/** @format */

import React, {createContext, useState, useContext} from 'react';
import {Audio} from 'expo-av';
import Files from '@/interfaces/Files';

const MusicPlayerContext = createContext<{
  currentTrack: Files | null;
  isPlaying: boolean;
  playTrack: (track: Files) => void;
  togglePlayback: () => void;
  stopPlayback: () => void;
}>({
  currentTrack: null,
  isPlaying: false,
  playTrack: (track: Files) => {},
  togglePlayback: () => {},
  stopPlayback: () => {},
});

export const MusicPlayerProvider = ({ children }  : any ) => {
    const [currentTrack, setCurrentTrack] = useState<Files | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playTrack = async (track : any) => {
    if (sound) {
      await sound.unloadAsync();
    }
    const {sound: newSound} = await Audio.Sound.createAsync(
      {uri: track.uri},
      {shouldPlay: true}
    );
    setSound(newSound);
    setCurrentTrack(track);
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

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlayback,
        stopPlayback,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => useContext(MusicPlayerContext);
