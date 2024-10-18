import React, { createContext, useContext } from 'react';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';

// Create a context with a default value of DefaultTheme
const ThemeContext = createContext<Theme>(DefaultTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme; 

  return (
    // Provide the determined theme to the context
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);