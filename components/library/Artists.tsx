import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Updated Artists component
export default function Artists() {
  const [artists, setArtists] = useState<{ name: string; songs: { title: string; imageUrl: string | null }[]; imageUrl: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geniusApiToken, setGeniusApiToken] = useState<string | null>(null); // State for the API token
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null); // State for the selected artist

  // Fetch API token from AsyncStorage when the component mounts
  useEffect(() => {
    const fetchApiToken = async () => {
      try {
        const token = await AsyncStorage.getItem("apiCode");
        if (token) {
          setGeniusApiToken(token); // Set the token in the state
        } else {
          setError("API token not found.");
        }
      } catch (err) {
        console.error("Error fetching API token:", err);
        setError("Failed to retrieve API token.");
      }
    };

    fetchApiToken();
  }, []);

  useEffect(() => {
    if (!geniusApiToken) return; // Don't fetch artists if token is not set

    const fetchArtists = async () => {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Media Library permission is required to access audio files.");
        setLoading(false);
        return;
      }

      const cachedData = await loadFromCache();
      if (cachedData) {
        setArtists(cachedData);
        setLoading(false);
      }

      try {
        const audioFiles = await fetchAudioFiles();
        if (audioFiles.length === 0) {
          setError("No audio files found on the device.");
          setLoading(false);
          return;
        }

        const artistMap: { [key: string]: { songs: { title: string; imageUrl: string | null }[] } } = {};
        for (const file of audioFiles) {
          const artist = await searchArtist(file.filename);
          if (artist) {
            if (!artistMap[artist.name]) artistMap[artist.name] = { songs: [] };
            artistMap[artist.name].songs.push({ title: file.filename, imageUrl: artist.imageUrl });
          }
        }

        const artistList = Object.entries(artistMap).map(([name, { songs }]) => ({
          name,
          songs,
          imageUrl: songs[0]?.imageUrl || null
        }));

        setArtists(artistList);
        await saveToCache(artistList); // Save to AsyncStorage
      } catch (err) {
        console.error(err);
        setError("Failed to fetch artists or process audio files.");
        setLoading(false);
      }
    };

    fetchArtists();
  }, [geniusApiToken]); // Dependency on geniusApiToken

  const fetchAudioFiles = async () => {
    const audioAssets: MediaLibrary.Asset[] = [];
    let hasMore = true;
    let after = undefined;

    while (hasMore) {
      const { assets, endCursor, hasNextPage } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 50,
        after,
      });
      audioAssets.push(...assets);
      hasMore = hasNextPage;
      after = endCursor;
    }

    return audioAssets.filter((asset) => asset.filename.endsWith(".mp3"));
  };

  const searchArtist = async (fileName: string): Promise<{ name: string; imageUrl: string | null } | null> => {
    try {
      const query = fileName.replace(".mp3", "");
      const response = await axios.get("https://api.genius.com/search", {
        headers: { Authorization: `Bearer ${geniusApiToken}` },
        params: { q: query },
      });

      const hits = response.data.response.hits;
      if (hits.length > 0) {
        const artist = hits[0].result.primary_artist;
        return { name: artist.name, imageUrl: artist.image_url || null };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Error querying Genius API:", err);
      return null;
    }
  };

  const saveToCache = async (data: any) => {
    try {
      await AsyncStorage.setItem("artistsData", JSON.stringify(data));
    } catch (err) {
      console.error("Error saving to cache:", err);
    }
  };

  const loadFromCache = async () => {
    try {
      const cachedData = await AsyncStorage.getItem("artistsData");
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (err) {
      console.error("Error loading from cache:", err);
      return null;
    }
  };

  const toggleArtist = (artistName: string) => {
    setSelectedArtist(selectedArtist === artistName ? null : artistName);
  };

  const renderArtist = ({ item }: { item: { name: string; songs: { title: string; imageUrl: string | null }[]; imageUrl: string | null } }) => (
    <View style={styles.artistContainer}>
      <TouchableOpacity onPress={() => toggleArtist(item.name)} style={styles.artistHeader}>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.albumImage} />}
        <Text style={styles.artistName}>{item.name}</Text>
        <Text style={styles.songCount}>{item.songs.length} Songs</Text>
      </TouchableOpacity>
      {selectedArtist === item.name && (
        <View style={styles.songsContainer}>
          {item.songs.map((song, index) => (
            <View key={index} style={styles.songContainer}>
              {song.imageUrl && <Image source={{ uri: song.imageUrl }} style={styles.songImage} />}
              <Text style={styles.songTitle}>{song.title}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading artists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.name}
        renderItem={renderArtist}
        ListEmptyComponent={<Text>No artists found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  artistContainer: {
    flexDirection: "column",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
  },
  artistHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  artistName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  songCount: {
    fontSize: 14,
    color: "#ddd",
    marginLeft: 10,
  },
  songsContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  songContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  songTitle: {
    fontSize: 14,
    color: "#ddd",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffcccc",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
