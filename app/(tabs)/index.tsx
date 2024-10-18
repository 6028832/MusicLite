import { useTheme } from '@/components/ThemeContext';
import { StyleSheet, View, Text } from 'react-native';

export default function TabOneScreen() {
  const theme = useTheme()
  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
      <Text style={[{color: theme.colors.text},styles.text]}>Home screen in development</Text>
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
