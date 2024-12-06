import { useTheme } from '@/components/ThemeContext';
import { StyleSheet, View, Text } from 'react-native';
import SearchBar from '../../components/searchcomp';
export default function TabTwoScreen() {
  const theme = useTheme()
  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
            <SearchBar />
      <Text style={[{color: theme.colors.text},styles.text]}>Search/Explore tab in development</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: "center",
    alignContent: "center",
    flexBasis: "auto"
  },
  text: {
    textAlign: "center",
  },
});
