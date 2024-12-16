import React, { useState, useEffect } from 'react';
import {Linking,SafeAreaView,View,Text,Image,StyleSheet,Modal,Switch,TextInput,Button,TouchableOpacity,ScrollView,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import * as Notifications from 'expo-notifications';

export default function Header() {
  const theme = useTheme();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('General');
  const [isApiEnabled, setIsApiEnabled] = useState(false);
  const [apiCode, setApiCode] = useState('');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const savedApiEnabled = await AsyncStorage.getItem('apiEnabled');
      const savedApiCode = await AsyncStorage.getItem('apiCode');
      const savedNotificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
      if (savedApiEnabled) setIsApiEnabled(savedApiEnabled === '1');
      if (savedApiCode) setApiCode(savedApiCode);
      if (savedNotificationsEnabled) setIsNotificationsEnabled(savedNotificationsEnabled === '1');
    };
    loadSettings();
  }, []);

  const toggleApi = async () => {
    setIsApiEnabled((prev) => !prev);
    await AsyncStorage.setItem('apiEnabled', !isApiEnabled ? '1' : '0');
  };

  const saveApiCode = async () => {
    try {
      await AsyncStorage.setItem('apiCode', apiCode); 
      alert('API code saved!');
    } catch (error) {
      console.error('Failed to save API code:', error);
    }
  };

  const toggleNotifications = async () => {
    setIsNotificationsEnabled((prev) => !prev);
    await AsyncStorage.setItem('notificationsEnabled', !isNotificationsEnabled ? '1' : '0');
    
    if (!isNotificationsEnabled) {
      // persmissie notificatie
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await scheduleNotification();
      } else {
        alert('Notification permission not granted.');
      }
    }
  };
  // onderste is een test notificatie
  const scheduleNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "You've got new music!",
          body: 'Check out the latest tracks in Music Lite!',
          data: { someData: 'goes here' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 }, // hoe lang het duurt totdat de notificatie wordt getriggerd nadat je de app heb geopend in de achtergrond
      });
      alert('Test notification scheduled!');
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };
  

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'General':
        return (
          <View style={styles.tabContentContainer}>
            <View style={styles.settingRow}>
              <Text style={[styles.label, { color: 'white' }]}>API Enabled</Text>
              <Switch value={isApiEnabled} onValueChange={toggleApi} />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.label, { color: 'white' }]}>API Code</Text>
              <TextInput
                style={[styles.input, { borderColor: 'white', color: 'white' }]}
                placeholder="Enter API code"
                placeholderTextColor="white"
                value={apiCode}
                onChangeText={setApiCode}
              />
            </View>
            {apiCode ? (
              <Text style={[styles.savedCode, { color: 'white' }]}>Saved API Code: {apiCode}</Text>
            ) : (
              <Text style={[styles.savedCode, { color: 'white' }]}>No API code saved</Text>
            )}
            <Button title="Save API Code" onPress={saveApiCode} color={theme.colors.text} />
          </View>
        );
      case 'Notifications':
        return (
          <View style={styles.tabContentContainer}>
          <View style={styles.settingRow}>
            <Text style={[styles.label, { color: 'white' }]}>Notifications Enabled</Text>
            <Switch value={isNotificationsEnabled} onValueChange={toggleNotifications} />
          </View>
          {isNotificationsEnabled ? (
            <Text style={[styles.savedCode, { color: 'white' }]}>Notifications are enabled</Text>
          ) : (
            <Text style={[styles.savedCode, { color: 'white' }]}>Notifications are disabled</Text>
          )}
          <Button title="Test Notification" onPress={scheduleNotification} color={theme.colors.text} />
        </View>
        );
      case 'About':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={[styles.tabContent, { color: 'white' }]}>About Music Lite</Text>
            <Text style={[styles.tabContent, { color: 'white' }]}>Version 1.0</Text>
            <Text style={[styles.tabContent, { color: 'white' }]}>Powered by the Genius API</Text>
            <Text style={[styles.tabContent, { color: 'white' }]}>
              Discover lyrics and more from your favorite songs.
            </Text>
            <Text style={[styles.tabContent, { color: 'white' }]}>
              For more information, visit{' '}
              <Text
                style={{ color: 'blue' }}
                onPress={() => Linking.openURL('https://genius.com/')}>
                Genius API general website
              </Text>
              ,{' '}
              <Text
                style={{ color: 'blue' }}
                onPress={() => Linking.openURL('https://docs.genius.com/')}>
                Genius API Documentation
              </Text>
              .
            </Text>
          </View>
        );
      case 'layout':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={[styles.tabContent, { color: 'white' }]}>Manage layout settings here.</Text>
          </View>
        );
      case 'Storage':
        return (
          <View style={styles.tabContentContainer}>
            <Text style={[styles.tabContent, { color: 'white' }]}>Manage storage settings here.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
      <View style={styles.leftContainer}>
        <Image style={styles.image} source={require('@/assets/images/react-logo.png')} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Music Lite</Text>
      </View>
      <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
        <Image style={styles.icon} source={require('@/assets/images/download.png')} />
      </TouchableOpacity>

      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        onRequestClose={() => setIsSettingsVisible(false)}
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
              <Image
                style={styles.backIcon}
                source={require('@/assets/images/back-arrow.png')}
              />
            </TouchableOpacity>
            <Text style={styles.navTitle}>{selectedTab} Settings</Text>
          </View>
          <View style={styles.settingsContent}>
            <View style={styles.tabContainer}>
              {['General', 'Notifications', 'About', 'layout', 'Storage'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={[
                    styles.tabButton,
                    selectedTab === tab && { backgroundColor: theme.colors.text },
                  ]}
                >
                  <Text style={styles.tabText}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView style={styles.scrollContainer}>
              {renderTabContent()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
    height: 90,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  icon: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-start',
    padding: 20,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  navTitle: {
    fontSize: 20,
    color: 'white',
  },
  settingsContent: {
    flexDirection: 'row',
    flex: 1,
  },
  tabContainer: {
    width: '30%',
    paddingRight: 10,
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 5,
    backgroundColor: 'black',
    borderRadius: 5,
  },
  tabText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
  },
  tabContentContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  scrollContainer: {
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  savedCode: {
    fontSize: 16,
    marginTop: 10,
    color: 'white',
  },
  tabContent: {
    fontSize: 16,
    marginBottom: 10,
    color: 'white',
  },
});
