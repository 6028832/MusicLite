import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tracks from '@/components/library/Tracks';  

export default function Home() {


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Albums</Text>
      
      <ScrollView>
       
     
        {/* Tracks component */}
        {/* <Tracks  />  */}
  
      </ScrollView>
  
    </View>
  );
}  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  albumCard: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 10,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
