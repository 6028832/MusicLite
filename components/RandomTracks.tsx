/** @format */

import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Files from '@/interfaces/Files';
import {MasterList} from '@/interfaces/MasterList';
import {TracksManager} from '@/constants/TracksManager';

export default function RandomTracks() {
  const [randomTracks, setRandomTracks] = useState<Files[]>([]);
  const manager = new TracksManager();
  const placeholderImage = 'https://via.placeholder.com/100';
  manager.firstBoot();

  const fetchTracks = async () => {
    let storedTracks: MasterList[] = await manager.getMasterList();
    let addTracks: Files[] = [];
    console.log(storedTracks);
    let amount = 9;
    if (storedTracks.length < 9) {
      amount = storedTracks.length;
    }
    for (let i = 0; i <= amount; i++) {
      const randomIndex = Math.round(Math.random() * storedTracks.length);
      const track: Files = await manager.fetchTrack(
        storedTracks[randomIndex].infoId
      );
      storedTracks.splice(randomIndex, 1);
      addTracks.push(track);
    }
    setRandomTracks(addTracks);
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const renderTrackItem = ({item}: {item: Files}) => (
    <View style={styles.trackItem}>
      <Image
        source={{uri: item.imageUrl || placeholderImage}}
        style={styles.image}
      />
      <View style={styles.trackDetails}>
        <Text style={styles.trackTitle}>{item.filename}</Text>
        <Text style={styles.artistName}>{item.artist || 'Unknown Artist'}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={randomTracks}
      keyExtractor={item => item.id.toString()}
      renderItem={renderTrackItem}
      contentContainerStyle={styles.container}
      horizontal={true} // Ensure the list is vertical
    />
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
  },
  trackItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    color: '#bbb',
    fontSize: 14,
  },
});
