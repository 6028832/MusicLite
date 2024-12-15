/** @format */

import Files from '@/interfaces/Files';
import React, {createContext, useState} from 'react';

export const AudioPlayerContext = createContext<any>({});

export const AudioPlayerProvider = ({children}: any) => {
  const [currentTrack, setCurrentTrack] = useState<Files | null>(null);
  const [isMiniPlayerVisible, setMiniPlayerVisible] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);

  const playAudio = (file: Files) => {
    setCurrentTrack(file);
    setMiniPlayerVisible(true);
  };

  const toggleFullScreen = () => {
    setFullScreen(prev => !prev);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        playAudio,
        currentTrack,
        isMiniPlayerVisible,
        isFullScreen,
        toggleFullScreen,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};