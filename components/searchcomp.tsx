import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage
import { getAllAudioFiles } from '@/constants/FetchSongs'; // Assuming you have this utility for fetching files
import Files from '@/interfaces/Files'; // Adjust this import based on your project structure

const SEARCH_STORAGE_KEY = 'recentSearches';

const FileSearchComponent = () => {
  const [files, setFiles] = useState<Files[]>([]);  
  const [searchQuery, setSearchQuery] = useState<string>('');  
  const [filteredFiles, setFilteredFiles] = useState<Files[]>([]);  

  const isDarkMode = Appearance.getColorScheme() === 'dark';

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const audioFiles = await getAllAudioFiles();  // Fetch audio files
        setFiles(audioFiles);
        setFilteredFiles(audioFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
    loadRecentSearch(); // Load recent search when the component mounts
  }, []);

  // Load recent search from AsyncStorage
  const loadRecentSearch = async () => {
    try {
      const recentSearch = await AsyncStorage.getItem(SEARCH_STORAGE_KEY);
      if (recentSearch) {
        setSearchQuery(recentSearch);  // Set search query from AsyncStorage
        handleSearch(recentSearch);  // Filter files based on the search query
      }
    } catch (error) {
      console.error('Error loading recent search:', error);
    }
  };

  // Store recent search in AsyncStorage
  const storeRecentSearch = async (query: string) => {
    try {
      await AsyncStorage.setItem(SEARCH_STORAGE_KEY, query);
    } catch (error) {
      console.error('Error storing search query:', error);
    }
  };

  // Handle search logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const filtered = files.filter((file) => 
      file.filename.toLowerCase().includes(query.toLowerCase())  // Filter by filename
    );

    const sorted = filtered.sort((a, b) => {
      const aTitleMatch = a.filename.toLowerCase().startsWith(query.toLowerCase());
      const bTitleMatch = b.filename.toLowerCase().startsWith(query.toLowerCase());

      return aTitleMatch && !bTitleMatch ? -1 : bTitleMatch && !aTitleMatch ? 1 : 0;
    });

    setFilteredFiles(sorted);
    storeRecentSearch(query);  // Store the search query in AsyncStorage
  };

  // Remove file extension
  const removeFileExtension = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, '');  // Removes file extension
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

      <Text style={[styles.filesHeader, { color: isDarkMode ? '#fff' : '#000' }]}>
        Files:
      </Text>
      
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.fileItem}>
            {item.artwork ? (
              <Image source={{ uri: item.artwork }} style={styles.artwork} />
            ) : (
              <View style={styles.artworkPlaceholder}>
                <Text style={styles.artworkText}>No Artwork</Text>
              </View>
            )}
            <View style={styles.textContainer}>
              <Text style={[styles.fileTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                {removeFileExtension(item.filename)} {/* Display filename without extension */}
              </Text>
              {item.artist && item.artist !== 'Unknown Artist' && (
                <Text style={[styles.artist, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {item.artist}
                </Text>
              )}
            </View>
          </View>
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
  filesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  },
  fileTitle: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  artist: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#888',
    marginTop: 4, // Space between title and artist
  },
});

export default FileSearchComponent;
