import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Button,
  Alert,
} from 'react-native';
import { useMusicPlayer } from '@/components/context/AudioPlayer';
import { useTheme } from '@react-navigation/native';
import { MusicPlayerContextInterface } from '@/interfaces/MusicPlayerContext';
import { fetchLyricsByFilename } from '@/constants/Fetchlyrics';


const FullScreenPlayer = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const { queue, currentTrackIndex, playTrack, skipTrack, previousTrack, togglePlayback, isPlaying } = useMusicPlayer() as MusicPlayerContextInterface;
  const theme = useTheme();
  const currentTrack = queue[currentTrackIndex];

  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState<boolean>(false);
  const musicPlayer = useMusicPlayer();

  useEffect(() => {
    const fetchLyricsForTrack = async () => {
      if (!currentTrack?.artist || !currentTrack?.filename) return;

      setLoadingLyrics(true);
      const fetchedLyrics = await fetchLyricsByFilename(currentTrack.filename);
      setLyrics(fetchedLyrics);
      setLoadingLyrics(false);
    };

    fetchLyricsForTrack();
  }, [currentTrack]);



  if (!isVisible || !currentTrack) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}
      >
        {/* Top of the full screen player */}
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Image
            style={styles.backIcon}
            source={require('@/assets/images/back-arrow.png')}
          />
        </TouchableOpacity>
        <Image source={{uri: currentTrack.imageUrl}} style={styles.image} />
        <View>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {currentTrack.filename}
          </Text>
          <Text style={[styles.artist, {color: theme.colors.text}]}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Playbar of the full screen player */}
        <View style={styles.playBar}>
          <TouchableOpacity
            onPress={previousTrack}
            style={styles.controlButton}
          >
            <Text style={[styles.controlText, {color: theme.colors.text}]}>
              ⏮
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePlayback}
            style={[styles.playButton, styles.controlButton]}
          >
            <Text style={[styles.playText, {color: theme.colors.text}]}>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={skipTrack} style={styles.controlButton}>
            <Text style={[styles.controlText, {color: theme.colors.text}]}>
              ⏭
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom of the full screen player */}
        <View
          style={[styles.bottom, {backgroundColor: theme.colors.background}]}
        >
          <Text style={[styles.queueLyricsTitle, {color: theme.colors.text}]}>
            UP NEXT
          </Text>
          {/* Lyrics Display */}
          <View style={styles.lyricsContainer}>
            {loadingLyrics ? (
              <Text style={styles.lyrics}>Loading lyrics...</Text>
            ) : (
              <Text style={styles.lyrics}>
                {lyrics || 'No lyrics available'}
              </Text>
            )}
          </View>
        </View>

        {/* Track Queue */}
        <FlatList
          style={{backgroundColor: theme.colors.background}}
          data={queue}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => playTrack(index)}
              style={[
                styles.track,
                index === currentTrackIndex && styles.activeTrack,
              ]}
            >
              <Text style={[styles.trackName, {color: theme.colors.text}]}>
                {index === currentTrackIndex
                  ? `▶ ${item.filename}`
                  : item.filename}
              </Text>
              <TouchableOpacity
                onPress={() => musicPlayer?.removeFromQueue(item.filename)}
                style={styles.settingsIconContainer}
              >
                <Text style={styles.settingsIcon}>❌</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  backButton: {padding: 10},
  backIcon: {width: 24, height: 24},
  image: {width: '100%', height: 200, borderRadius: 8, marginVertical: 16},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 4},
  artist: {fontSize: 14, marginBottom: 16},
  playBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 8,
  },
  controlButton: {padding: 10},
  settingsIconContainer: {
    width: 20,
    height: 20,
  },
  settingsIcon: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  controlText: {fontSize: 24},
  playButton: {marginHorizontal: 16},
  playText: {fontSize: 16, fontWeight: 'bold'},
  lyricsContainer: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  queueLyricsTitle: {fontSize: 14, lineHeight: 20, textAlign: 'center'},
  track: {paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'},
  activeTrack: {backgroundColor: '#282828'},
  trackName: {fontSize: 16},
  bottom: {marginVertical: 16, paddingVertical: 8},
  clearButton: {
    padding: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 8,
    marginVertical: 8,
  },
  lyrics: {color: '#fff', fontSize: 14, lineHeight: 20, textAlign: 'center'},
});

export default FullScreenPlayer;
