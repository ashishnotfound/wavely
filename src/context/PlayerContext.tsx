import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Song, useData } from './DataContext';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  playSong: (song: Song) => void;
  playPlaylist: (songs: Song[], startIndex?: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  shuffle: boolean;
  toggleShuffle: () => void;
  repeat: 'off' | 'all' | 'one';
  toggleRepeat: () => void;
  mediaRef: React.RefObject<HTMLMediaElement>;
  currentSongUrl: string | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const { recordPlay, updateProgress, fetchContinueListening } = useData();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');

  const mediaRef = useRef<HTMLMediaElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentSong?.file) {
      const url = URL.createObjectURL(currentSong.file);
      setCurrentSongUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setCurrentSongUrl(null);
    }
  }, [currentSong]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    media.volume = volume;

    const handleTimeUpdate = () => {
      setProgress(media.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => {
      if (currentSong) {
        // Clear progress when song ends
        updateProgress(currentSong.id, 0).then(() => fetchContinueListening());
      }
      if (repeat === 'one') {
        media.currentTime = 0;
        media.play();
      } else {
        nextSong();
      }
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, repeat]); // Re-bind when currentSong changes to capture it in closure

  // Periodically save progress
  useEffect(() => {
    if (isPlaying && currentSong) {
      progressIntervalRef.current = setInterval(() => {
        if (mediaRef.current) {
          updateProgress(currentSong.id, mediaRef.current.currentTime);
        }
      }, 5000); // Save every 5 seconds
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Save on pause
      if (currentSong && mediaRef.current) {
        updateProgress(currentSong.id, mediaRef.current.currentTime).then(() => fetchContinueListening());
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        const playPromise = mediaRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Ignore AbortError which happens when src changes while playing
            if (e.name !== 'AbortError') {
              console.error("Play error:", e);
            }
          });
        }
      } else {
        mediaRef.current.pause();
      }
    }
  }, [isPlaying]); // Removed currentSong dependency to avoid race conditions with autoPlay

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = volume;
    }
  }, [volume]);

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }
    
    // Just set state, the effect will handle play
    setCurrentSong(song);
    setIsPlaying(true);
    recordPlay(song.id);
    
    // If not in queue, add it
    if (!queue.find(s => s.id === song.id)) {
      setQueue([song]);
      setQueueIndex(0);
    }
  };

  const playPlaylist = (songs: Song[], startIndex = 0) => {
    setQueue(songs);
    setQueueIndex(startIndex);
    playSong(songs[startIndex]);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextSong = () => {
    if (queue.length === 0) return;
    
    let nextIndex = queueIndex + 1;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') nextIndex = 0;
      else {
        setIsPlaying(false);
        return;
      }
    }
    
    setQueueIndex(nextIndex);
    playSong(queue[nextIndex]);
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    
    // If more than 3 seconds in, restart song
    if (mediaRef.current && mediaRef.current.currentTime > 3) {
      mediaRef.current.currentTime = 0;
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;
    
    setQueueIndex(prevIndex);
    playSong(queue[prevIndex]);
  };

  const seek = (time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
  };

  const toggleShuffle = () => setShuffle(!shuffle);

  const toggleRepeat = () => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      volume,
      progress,
      duration,
      queue,
      playSong,
      playPlaylist,
      togglePlay,
      nextSong,
      prevSong,
      seek,
      setVolume,
      shuffle,
      toggleShuffle,
      repeat,
      toggleRepeat,
      mediaRef,
      currentSongUrl
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
