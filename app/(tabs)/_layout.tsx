import { Tabs } from 'expo-router';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AudioPlayerProvider } from '@/components/context/AudioPlayer';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AudioPlayerProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: 'Library',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} />
              ),
            }}
          />
        </Tabs>
    </AudioPlayerProvider>
  );
}
