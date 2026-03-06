import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { openDB, IDBPDatabase } from 'idb';

// Define DB Schema locally or import if I export it
interface WavelyDB {
  songs: {
    key: number;
    value: SongSchema;
    indexes: { 'created_at': number };
  };
  playlists: {
    key: number;
    value: PlaylistSchema;
    indexes: { 'created_at': number };
  };
  playlist_songs: {
    key: string; // composite key manually managed or auto
    value: PlaylistSongSchema;
    indexes: { 'playlist_id': number };
  };
  listening_history: {
    key: number;
    value: HistorySchema;
    indexes: { 'played_at': number };
  };
  playback_progress: {
    key: number;
    value: ProgressSchema;
    indexes: { 'last_updated': number };
  };
}

interface SongSchema {
  title: string;
  artist: string;
  album: string;
  duration: number;
  file: Blob;
  thumbnail: string | null;
  play_count: number;
  last_played: number | null;
  created_at: number;
  media_type: 'audio' | 'video';
  fileName: string;
}

interface PlaylistSchema {
  name: string;
  created_at: number;
}

interface PlaylistSongSchema {
  playlist_id: number;
  song_id: number;
  added_at: number;
}

interface HistorySchema {
  song_id: number;
  played_at: number;
}

interface ProgressSchema {
  song_id: number;
  progress: number;
  last_updated: number;
}

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  filepath: string; // Kept for compatibility, will be fileName
  thumbnail: string | null;
  play_count: number;
  last_played: number | null;
  created_at: number;
  added_at?: number;
  media_type?: 'audio' | 'video';
  file?: Blob; // Added for local playback
}

export interface Playlist {
  id: number;
  name: string;
  created_at: number;
  songs?: Song[];
}

interface DataContextType {
  songs: Song[];
  playlists: Playlist[];
  history: Song[];
  continueListening: Song[];
  loading: boolean;
  refreshData: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  fetchContinueListening: () => Promise<void>;
  updateProgress: (songId: number, progress: number) => Promise<void>;
  uploadSong: (file: File) => Promise<void>;
  updateSong: (id: number, data: Partial<Song>) => Promise<void>;
  deleteSong: (id: number) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (id: number) => Promise<void>;
  addToPlaylist: (playlistId: number, songId: number) => Promise<void>;
  removeFromPlaylist: (playlistId: number, songId: number) => Promise<void>;
  recordPlay: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// DB Initialization
let dbPromise: Promise<IDBPDatabase<WavelyDB>>;
const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<WavelyDB>('wavely-db', 1, {
      upgrade(db) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
        songStore.createIndex('created_at', 'created_at');

        const playlistStore = db.createObjectStore('playlists', { keyPath: 'id', autoIncrement: true });
        playlistStore.createIndex('created_at', 'created_at');

        const playlistSongStore = db.createObjectStore('playlist_songs', { keyPath: 'id', autoIncrement: true });
        playlistSongStore.createIndex('playlist_id', 'playlist_id');

        const historyStore = db.createObjectStore('listening_history', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('played_at', 'played_at');

        const progressStore = db.createObjectStore('playback_progress', { keyPath: 'song_id' });
        progressStore.createIndex('last_updated', 'last_updated');
      },
    });
  }
  return dbPromise;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [continueListening, setContinueListening] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = useCallback(async () => {
    try {
      const db = await initDB();
      const allSongs = await db.getAllFromIndex('songs', 'created_at');
      // Map DB schema to App schema
      const mappedSongs: Song[] = allSongs.reverse().map(s => ({
        ...s,
        id: s.id as number,
        filepath: s.fileName,
        file: s.file
      }));
      setSongs(mappedSongs);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      const db = await initDB();
      const allPlaylists = await db.getAllFromIndex('playlists', 'created_at');
      setPlaylists(allPlaylists.reverse().map(p => ({ ...p, id: p.id as number })));
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const db = await initDB();
      const historyItems = await db.getAllFromIndex('listening_history', 'played_at');
      const recent = historyItems.reverse().slice(0, 50);
      
      const historySongs: Song[] = [];
      for (const item of recent) {
        const song = await db.get('songs', item.song_id);
        if (song) {
          historySongs.push({
            ...song,
            id: song.id as number,
            filepath: song.fileName,
            file: song.file,
            last_played: item.played_at // Use the history timestamp
          });
        }
      }
      setHistory(historySongs);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  }, []);

  const fetchContinueListening = useCallback(async () => {
    try {
      const db = await initDB();
      const progressItems = await db.getAllFromIndex('playback_progress', 'last_updated');
      const recent = progressItems.reverse().slice(0, 10);
      
      const continueSongs: Song[] = [];
      for (const item of recent) {
        const song = await db.get('songs', item.song_id);
        if (song && item.progress > 0 && item.progress < (song.duration * 0.95)) {
          continueSongs.push({
            ...song,
            id: song.id as number,
            filepath: song.fileName,
            file: song.file,
            // We could add progress here if Song interface supported it, 
            // but for now we just return the songs
          });
        }
      }
      setContinueListening(continueSongs);
    } catch (error) {
      console.error('Failed to fetch continue listening:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSongs(), fetchPlaylists(), fetchHistory(), fetchContinueListening()]);
    setLoading(false);
  }, [fetchSongs, fetchPlaylists, fetchHistory, fetchContinueListening]);

  useEffect(() => {
    refreshData();
  }, []);

  const updateProgress = async (songId: number, progress: number) => {
    try {
      const db = await initDB();
      await db.put('playback_progress', {
        song_id: songId,
        progress,
        last_updated: Date.now()
      });
    } catch (error) {
      console.error('Update progress error:', error);
    }
  };

  const uploadSong = async (file: File) => {
    try {
      const db = await initDB();
      
      // Basic metadata extraction (since we removed backend music-metadata)
      // In a real app, use music-metadata-browser here
      const title = file.name.replace(/\.[^/.]+$/, "");
      const artist = 'Unknown Artist';
      const album = 'Unknown Album';
      
      // Get duration
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => {
          resolve(audio.duration);
          URL.revokeObjectURL(audio.src);
        };
        audio.onerror = () => resolve(0);
      });

      const isVideo = file.type.startsWith('video/');

      await db.add('songs', {
        title,
        artist,
        album,
        duration,
        file,
        fileName: file.name,
        thumbnail: null,
        play_count: 0,
        last_played: null,
        created_at: Date.now(),
        media_type: isVideo ? 'video' : 'audio'
      });
      
      await fetchSongs();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const updateSong = async (id: number, data: Partial<Song>) => {
    try {
      const db = await initDB();
      const song = await db.get('songs', id);
      if (song) {
        await db.put('songs', { ...song, ...data });
        await fetchSongs();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const deleteSong = async (id: number) => {
    try {
      const db = await initDB();
      await db.delete('songs', id);
      // Cascade delete would go here
      await fetchSongs();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const createPlaylist = async (name: string) => {
    try {
      const db = await initDB();
      await db.add('playlists', { name, created_at: Date.now() });
      await fetchPlaylists();
    } catch (error) {
      console.error('Create playlist error:', error);
    }
  };

  const deletePlaylist = async (id: number) => {
    try {
      const db = await initDB();
      await db.delete('playlists', id);
      await fetchPlaylists();
    } catch (error) {
      console.error('Delete playlist error:', error);
    }
  };

  const addToPlaylist = async (playlistId: number, songId: number) => {
    try {
      const db = await initDB();
      await db.add('playlist_songs', {
        playlist_id: playlistId,
        song_id: songId,
        added_at: Date.now()
      });
    } catch (error) {
      console.error('Add to playlist error:', error);
      throw error;
    }
  };

  const removeFromPlaylist = async (playlistId: number, songId: number) => {
    try {
      const db = await initDB();
      // Need to find the key first since we used autoIncrement for playlist_songs
      // Ideally we should use a composite key or index
      const tx = db.transaction('playlist_songs', 'readwrite');
      const index = tx.store.index('playlist_id');
      let cursor = await index.openCursor(IDBKeyRange.only(playlistId));
      
      while (cursor) {
        if (cursor.value.song_id === songId) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      await tx.done;
    } catch (error) {
      console.error('Remove from playlist error:', error);
    }
  };

  const recordPlay = async (id: number) => {
    try {
      const db = await initDB();
      const song = await db.get('songs', id);
      if (song) {
        song.play_count = (song.play_count || 0) + 1;
        song.last_played = Date.now();
        await db.put('songs', song);
        await db.add('listening_history', { song_id: id, played_at: Date.now() });
        
        // Update local state
        setSongs(prev => prev.map(s => 
          s.id === id ? { ...s, play_count: s.play_count + 1, last_played: Date.now() } : s
        ));
        fetchHistory();
      }
    } catch (error) {
      console.error('Record play error:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      songs,
      playlists,
      history,
      continueListening,
      loading,
      refreshData,
      fetchHistory,
      fetchContinueListening,
      updateProgress,
      uploadSong,
      updateSong,
      deleteSong,
      createPlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      recordPlay
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
