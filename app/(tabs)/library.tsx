/** @format */

import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';


import Tracks from '@/components/library/Tracks';
import Albums from '@/components/library/Albums';
import Playlists from '@/components/library/Playlists';
import Artists from '@/components/library/Artists';

export default function Library() {
  const [filter, setFilter] = useState<
    'Tracks' | 'Albums' | 'Playlists' | 'Artists'
  >('Tracks');

  const renderContent = () => {
    switch (filter) {
      case 'Tracks':
        return <Tracks />;
      case 'Albums':
        return <Albums />;
      case 'Playlists':
        return <Playlists />;
      case 'Artists':
        return <Artists />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {['Tracks', 'Albums', 'Playlists', 'Artists'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setFilter(tab)}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabText: {
    margin: 10,
    fontSize: 16,
    color: '#000',
  },
});