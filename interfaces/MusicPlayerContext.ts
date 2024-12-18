/** @format */

import Files from "./Files";

export interface MusicPlayerContextInterface {
  queue: Files[];

  currentTrack: Files | null;

  currentTrackIndex: number;

  setQueue: React.Dispatch<React.SetStateAction<Files[]>>;

  playTrack: (trackIndex: number) => Promise<void>;

  skipTrack: () => Promise<void>;

  previousTrack: () => Promise<void>;

  shuffleQueue: () => void;

  togglePlayback: () => Promise<void>;

  stopPlayback: () => Promise<void>;

  isPlaying: boolean;

  setQueueWithPlaylist: (playlistId: string) => Promise<void>;
  
  removeFromQueue: (fileName: string) => Promise<void>;
}
