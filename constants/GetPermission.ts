import * as MediaLibrary from "expo-media-library";

export const getPermissions = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access media is required!");
  }
};
