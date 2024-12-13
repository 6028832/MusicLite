/** @format */

import {Audio} from 'expo-av';
import React, { useState } from 'react';
import { createContext } from 'react';
import { ReactNode } from 'react';

export const AudioPlayerContext = React.createContext({
  playAudio: async (uri: string) => {},
  pauseAudio: async () => {},
  stopAudio: async () => {},
});


export function AudioPlayerProvider({children}: {children: ReactNode}) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playAudio = async (uri: any) => {
    if (sound) await sound.unloadAsync();
    const {sound: newSound} = await Audio.Sound.createAsync({uri});
    setSound(newSound);
    await newSound.playAsync();
  };

  const pauseAudio = async () => {
    if (sound) await sound.pauseAsync();
  };

  const stopAudio = async () => {
    if (sound) await sound.stopAsync();
  };

  return (
    <AudioPlayerContext.Provider value={{playAudio, pauseAudio, stopAudio}}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
