/** @format */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {useMusicPlayer} from '@/components/context/AudioPlayer';
import {useTheme} from '@react-navigation/native';

const FullScreenPlayer = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme();
  const {currentTrack, isPlaying, togglePlayback} = useMusicPlayer();
  const [isFullScreenVisible, setFullScreenVisible] = useState(false);

  if (!currentTrack) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onClose}>
          <Image
            style={styles.backIcon}
            source={require('@/assets/images/back-arrow.png')}
          />
        </TouchableOpacity>

        <Image source={{uri: currentTrack.imageUrl}} style={styles.image} />
        <Text style={styles.title}>{currentTrack.filename}</Text>
        <Text style={styles.artist}>{currentTrack.artist}</Text>
        <TouchableOpacity onPress={togglePlayback}>
          <Text style={[{color: theme.colors.text}]}>
            {isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
  artist: {
    color: '#aaa',
    fontSize: 18,
    marginBottom: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
});

export default FullScreenPlayer;
