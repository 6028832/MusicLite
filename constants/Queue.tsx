import Files from "@/interfaces/Files";
import { useState } from "react";

const [queue, setQueue] = useState<Files[]>([]);

const addToQueue = (track: Files) => setQueue(prevQueue => [...prevQueue, track]);

const removeFromQueue = (id: string) =>
  setQueue(prevQueue => prevQueue.filter(track => track.id !== id));

const reorderQueue = (startIndex: number, endIndex: number) => {
  const newQueue = Array.from(queue);
  const [removed] = newQueue.splice(startIndex, 1);
  newQueue.splice(endIndex, 0, removed);
  setQueue(newQueue);
};
