/** @format */

import React, {useEffect, useState, useContext} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {getAllAudioFiles} from '@/constants/FetchSongs'; // Update the path to the correct module
import {AudioPlayerContext} from '@/components/context/AudioPlayer';
import Files from '@/interfaces/Files';

export default function Tracks() {
  const [tracks, setTracks] = useState<Files[]>([]);
  const {playAudio} = useContext(AudioPlayerContext);

  useEffect(() => {
    (async () => {
      const audioFiles = await getAllAudioFiles();
      setTracks(audioFiles);
    })();
  }, []);

  return (
    <View>
      {tracks.map(track => (
        <TouchableOpacity key={track.id} onPress={() => playAudio(track.uri)}>
          <Text>{track.filename}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
