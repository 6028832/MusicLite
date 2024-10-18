import {getAllAudioFiles} from "@/constants/FetchSongs";
import { getPermissions } from "@/constants/GetPermission";
import React from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import Files from "@/interfaces/Files";

export default function HomeScreen() {
  const [audioFiles, setAudioFiles] = React.useState<Files[]>([]);
  React.useEffect(() => {
    (async () => {
      await getPermissions();
      const files = await getAllAudioFiles();
      setAudioFiles(files);
    })();
  }, []);

  return (
    <ScrollView>
      {audioFiles.map((file) => (
        <Text key={file.id}>{file.filename}</Text>
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
})