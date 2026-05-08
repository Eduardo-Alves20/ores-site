import { createContext, useContext, useRef, useState } from 'react';

const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const [track, setTrack] = useState(null);
  const audioRef = useRef(null);

  const play = (t) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setTrack(t);
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setTrack(null);
  };

  return (
    <AudioPlayerContext.Provider value={{ track, audioRef, play, stop }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export const useAudioPlayer = () => useContext(AudioPlayerContext);
