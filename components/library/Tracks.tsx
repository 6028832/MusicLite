import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import Tracks from '@/components/pages/Tracks';  

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Tracks />
    </SafeAreaView>
  );
};

export default App;
