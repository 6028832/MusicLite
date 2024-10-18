import * as MediaLibrary from "expo-media-library";

export const getPermissions = async (requestPermission: () => Promise<MediaLibrary.PermissionResponse>) => {
  const { status } = await requestPermission();
  if (status !== "granted") {
    alert("Permission to access media is required!");
    return false;
  }
  return true;
};