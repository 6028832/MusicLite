/** @format */

import * as MediaLibrary from 'expo-media-library';

export default interface Files {
  id: string;

  filename: string;

  uri: string;

  mediaType: MediaLibrary.MediaTypeValue;

  mediaSubtypes?: MediaLibrary.MediaSubtype[];

  width: number;

  height: number;

  duration: number;

  creationTime: number;

  modificationTime: number;

  albumId?: string | number;

  imageUrl?: string | undefined;

  artist: string;
}