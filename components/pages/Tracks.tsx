import { getAllAudioFiles } from "@/constants/FetchSongs";
import { getPermissions } from "@/constants/GetPermission";
import React from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import Files from "@/interfaces/Files";
import { useTheme } from "@react-navigation/native";
import * as MediaLibrary from 'expo-media-library';

export default function Tracks() : any{
    const [audioFiles, setAudioFiles] = React.useState<Files[]>([]);
  const theme = useTheme()
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()
  React.useEffect(() => {
    (async () => {
      if (requestPermission) {
        await getPermissions(requestPermission);
        const files = await getAllAudioFiles();
        setAudioFiles(files);
      }
    })();
  }, []);

  return (
    <ScrollView
      style={[{ backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.container} >
      {audioFiles.map((file) => (
        <Text style={[styles.text, { color: theme.colors.text }]} key={file.id}>{file.filename}</Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});