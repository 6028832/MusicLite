import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MusicPlayerProvider } from '@/components/context/AudioPlayer';
import MiniPlayer from '@/components/MiniPlayer';
import FullScreenPlayer from '@/components/FullPlayer';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isFullScreen, setFullScreen] = useState(false);

  return (
    <MusicPlayerProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'home' : 'home-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'code-slash' : 'code-slash-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({color, focused}) => (
              <TabBarIcon
                name={focused ? 'book' : 'book-outline'}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
      <FullScreenPlayer
        isVisible={isFullScreen}
        onClose={() => setFullScreen(false)}
      />
    </MusicPlayerProvider>
  );
}
