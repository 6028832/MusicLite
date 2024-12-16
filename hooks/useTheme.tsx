/** @format */

import React, {createContext, useContext} from 'react';
import {DarkTheme, DefaultTheme, Theme} from '@react-navigation/native';
import {useColorScheme} from '@/hooks/useColorScheme';
import {Colors} from '@/constants/Colors';

type ThemeType = 'dark' | 'light';

// Create a context with a default value of DefaultTheme
const ThemeContext = createContext<Theme>(DefaultTheme);

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    // Provide the determined theme to the context
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

// Hook to get the theme, allowing parameter-based override
export const useTheme = (overrideTheme?: ThemeType) => {
  const systemTheme = useColorScheme();
  const resolvedTheme = overrideTheme ?? systemTheme ?? 'light';
  const theme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;

  return {theme, colors: Colors[resolvedTheme]};
};
