/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';

const toggleFavorite = async track => {
  const favorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
  if (favorites.find(fav => fav.id === track.id)) {
    await AsyncStorage.setItem(
      'favorites',
      JSON.stringify(favorites.filter(fav => fav.id !== track.id))
    );
  } else {
    await AsyncStorage.setItem(
      'favorites',
      JSON.stringify([...favorites, track])
    );
  }
};
