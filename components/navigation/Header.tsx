import { useTheme } from '@/components/ThemeContext';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function Header() {
  const theme = useTheme();

  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
      <View style={styles.leftContainer}>
        <Image style={styles.image} source={require('@/assets/images/react-logo.png')} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Music Lite</Text>
      </View>
      <Image style={styles.profileImage} source={require('@/assets/images/react-logo.png')} />
    </View>
  );
}

const styles = StyleSheet.create({
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
  profileImage: {
    width: 40,
    height: 40,
  },
});