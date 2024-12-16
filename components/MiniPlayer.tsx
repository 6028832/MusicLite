/** @format */

import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useMusicPlayer} from './context/AudioPlayer';
import FullScreenPlayer from '@/components/FullPlayer';
import {useTheme} from '@react-navigation/native';
import {MusicPlayerContextInterface} from '@/interfaces/MusicPlayerContext';

const MiniPlayer = () => {
  const {queue, currentTrackIndex, togglePlayback, isPlaying} = useMusicPlayer() as MusicPlayerContextInterface;
  const [isFullScreenVisible, setFullScreenVisible] = useState(false);
  const theme = useTheme();
  const currentTrack = queue[currentTrackIndex];

  if (!currentTrack) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setFullScreenVisible(true)}
        style={[styles.container, {backgroundColor: theme.colors.background}]}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={{uri: currentTrack.imageUrl}} style={styles.image} />
          <View style={styles.playerbarTextContainer}>
            <Text style={[styles.trackName, {color: theme.colors.text}]}>
              {currentTrack.filename}
            </Text>
            <Text style={[styles.trackName, {color: theme.colors.text}]}>
              {currentTrack.artist}
            </Text>
          </View>
          <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
            <Text style={[styles.playText, {color: theme.colors.text}]}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  trackName: {fontSize: 16, fontWeight: 'bold', flex: 1},
  playButton: {marginLeft: 16},
  playText: { fontSize: 14 },
  image: { width: 50, height: 50, borderRadius: 8 }, 
  playerbarTextContainer: { flex: 1, marginHorizontal: 16 },
});

export default MiniPlayer;
