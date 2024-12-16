/** @format */

import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useMusicPlayer} from './context/AudioPlayer';
import FullScreenPlayer from '@/components/FullPlayer';
import { useTheme } from '@react-navigation/native';

const MiniPlayer = () => {
  const {currentTrack, isPlaying, togglePlayback} = useMusicPlayer();
  const [isFullScreenVisible, setFullScreenVisible] = useState(false);
  const theme = useTheme();

  if (!currentTrack) return null;

  return (
    <>
      <TouchableOpacity onPress={() => setFullScreenVisible(true)}>
        <View style={styles.container}>
          <Text style={styles.trackName}>{currentTrack.filename}</Text>
          <TouchableOpacity onPress={togglePlayback}>
            <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <FullScreenPlayer
        isVisible={isFullScreenVisible}
        onClose={() => setFullScreenVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  control: {
    fontSize: 16,
    color: 'blue',
  },
});

export default MiniPlayer;
