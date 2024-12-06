import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, Appearance } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

const SEARCH_STORAGE_KEY = 'recentSearches';

const FileSearchComponent = () => {
  const [files, setFiles] = useState<any[]>([]);  
  const [searchQuery, setSearchQuery] = useState<string>('');  
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);  
  const [recentSearches, setRecentSearches] = useState<string[]>([]);  

  const isDarkMode = Appearance.getColorScheme() === 'dark';

  useEffect(() => {
    const fetchPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
        return;
      }
      fetchFiles();
    };

    fetchPermissions();
  }, []);

  const fetchFiles = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,  
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],  
      });

      const mp3Files = await Promise.all(media.assets.map(async (asset) => {
        if (asset.uri.endsWith('.mp3')) {
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);  
          console.log('Asset Info:', assetInfo); 

          const title = assetInfo?.title || asset.uri.split('/').pop()?.replace('.mp3', '') || 'Unknown Title';
          const artist = assetInfo?.artist || 'Unknown Artist'; // Get artist information
          const artwork = assetInfo?.artwork || null;

          return {
            uri: asset.uri,
            title,
            artist, // Store the artist
            artwork,
          };
        }
        return null;
      }));

      const filteredMp3Files = mp3Files.filter(file => file !== null);
      setFiles(filteredMp3Files);  
      setFilteredFiles(filteredMp3Files);  
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = files.filter((file) => 
      file.title.toLowerCase().includes(query.toLowerCase()) ||
      file.artist.toLowerCase().includes(query.toLowerCase()) // Search by artist as well
    );
    setFilteredFiles(filtered);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#fff' }]}>
      <TextInput
        style={[styles.searchInput, { color: isDarkMode ? '#fff' : '#000' }]}
        placeholder="Search for mp3 files"
        placeholderTextColor={isDarkMode ? '#ccc' : '#888'}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <Text style={[styles.filesHeader, { color: isDarkMode ? '#fff' : '#000' }]}>
        MP3 Files:
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
                {item.title}
              </Text>
              {item.artist !== 'Unknown Artist' && (
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
  },
});

export default FileSearchComponent;
