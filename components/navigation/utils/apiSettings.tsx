import AsyncStorage from '@react-native-async-storage/async-storage';

export const getApiEnabled = async () => {
  const apiEnabled = await AsyncStorage.getItem('apiEnabled');
  return apiEnabled === '1'; 
};

export const getApiCode = async () => {
  return await AsyncStorage.getItem('apiCode') || ''; 
};
