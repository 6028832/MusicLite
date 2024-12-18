import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, TouchableOpacity, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllAudioFiles } from '@/constants/FetchSongs';
import { useMusicPlayer } from '@/components/context/AudioPlayer'; // Import the MusicPlayerContext
import Files from '@/interfaces/Files';

const SEARCH_STORAGE_KEY = 'recentSearches';
const GENIUS_API_BASE_URL = 'https://api.genius.com';

const FileSearchComponent = () => {
  const [files, setFiles] = useState<Files[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredFiles, setFilteredFiles] = useState<Files[]>([]);
  const [loading, setLoading] = useState(false);
  const [geniusAccessToken, setGeniusAccessToken] = useState<string>('');
  const { playTrack, setQueue, queue, currentTrackIndex, togglePlayback, isPlaying } = useMusicPlayer();

  const isDarkMode = Appearance.getColorScheme() === 'dark';

  useEffect(() => {
    const loadApiCode = async () => {
      const apiCode = await AsyncStorage.getItem('apiCode') || '';
      setGeniusAccessToken(apiCode);
    };

    loadApiCode();
  }, []);

  useEffect(() => {
    if (geniusAccessToken) {
      fetchFiles();
    }
  }, [geniusAccessToken]);

  const fetchTrackInfo = async (trackTitle: string, artist: string) => {
    try {
      const searchTrack = async (query: string) => {
        const response = await fetch(
          `${GENIUS_API_BASE_URL}/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${geniusAccessToken}`,
            },
          }
        );
        const data = await response.json();
        return data.response.hits;
      };

      let hits = await searchTrack(trackTitle);
      if (hits.length === 0) {
        hits = await searchTrack(artist);
      }

      if (hits.length === 0) {
        return { artist: 'Unknown Artist', imageUrl: '' };
      }

      const hit = hits[0];
      return {
        artist: hit.result.primary_artist.name,
        imageUrl: hit.result.primary_artist.image_url,
      };
    } catch (error) {
      console.error('Error fetching Genius track info:', error);
      return { artist: 'Unknown Artist', imageUrl: '' };
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const audioFiles = await getAllAudioFiles();
      setFiles(audioFiles);
      setFilteredFiles(audioFiles);

      const filesWithInfo = await Promise.all(
        audioFiles.map(async (file) => {
          const [trackTitle, artist] = file.filename.split(' - ');
          const trackInfo = await fetchTrackInfo(trackTitle.trim(), artist ? artist.trim() : '');
          return { ...file, ...trackInfo };
        })
      );
      setFiles(filesWithInfo);
      setFilteredFiles(filesWithInfo);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const filtered = files.filter((file) =>
      file.filename.toLowerCase().includes(query.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      const aTitleMatch = a.filename.toLowerCase().startsWith(query.toLowerCase());
      const bTitleMatch = b.filename.toLowerCase().startsWith(query.toLowerCase());

      return aTitleMatch && !bTitleMatch ? -1 : bTitleMatch && !aTitleMatch ? 1 : 0;
    });

    setFilteredFiles(sorted);
    AsyncStorage.setItem(SEARCH_STORAGE_KEY, query);
  };

  const handlePlayTrack = (index: number) => {
    setQueue(filteredFiles);
    playTrack(index);
  };

  const handleTogglePlayback = () => {
    togglePlayback();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <TextInput
        style={[styles.searchInput, { color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="Search files"
        placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading && <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#000' }]}>Loading...</Text>}
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.uri}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.fileItem, { backgroundColor: isDarkMode ? '#333' : '#f8f8f8' }]}
            onPress={() => handlePlayTrack(index)}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.artwork} />
            ) : (
              <View style={styles.artworkPlaceholder}>
                <Text style={styles.artworkText}>No Artwork</Text>
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={[styles.fileTitle, { color: isDarkMode ? '#fff' : '#000' }]}>{item.filename}</Text>
              {item.artist && item.artist !== 'Unknown Artist' && (
                <Text style={[styles.artist, { color: isDarkMode ? '#fff' : '#000' }]}>{item.artist}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  artworkPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  artworkText: {
    color: '#fff',
    fontSize: 10,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  fileTitle: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  artist: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#888',
    marginTop: 4,
  },
  playButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 5,
  },
});

export default FileSearchComponent;
