import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  getRecentSearches,
  saveSearchQuery,
  removeSearchQuery,
} from './navigation/utils/search'; // Adjust the path as needed

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches when the component mounts
  useEffect(() => {
    const loadSearches = async () => {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    };
    loadSearches();
  }, []);

  // Handle saving a new search query
  const handleSearch = async () => {
    if (!query.trim()) return;
    const updatedSearches = await saveSearchQuery(query);
    setRecentSearches(updatedSearches);
    setQuery('');

    // Trigger search functionality here
    console.log(`Searching for: ${query}`);
  };

  // Handle removing a search query
  const handleClear = async (item: string) => {
    const updatedSearches = await removeSearchQuery(item);
    setRecentSearches(updatedSearches);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search for music..."
        onSubmitEditing={handleSearch}
      />
      <FlatList
        data={recentSearches}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.searchItem}>
            <TouchableOpacity onPress={() => setQuery(item)}>
              <Text style={styles.searchText}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleClear(item)}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={
          recentSearches.length > 0 && <Text style={styles.header}>Recent Searches</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  searchText: {
    fontSize: 16,
  },
  clearText: {
    fontSize: 18,
    color: 'red',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default SearchBar;
