import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, Playlist as PlaylistType, Song } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';
import { Play, Trash2, MoreHorizontal, Clock } from 'lucide-react';
import { formatTime } from '../utils/format';

export const Playlist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deletePlaylist, removeFromPlaylist } = useData();
  const { playPlaylist } = usePlayer();
  const [playlist, setPlaylist] = useState<PlaylistType & { songs: Song[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/playlists/${id}`);
        if (!res.ok) throw new Error('Playlist not found');
        const data = await res.json();
        setPlaylist(data);
      } catch (error) {
        console.error(error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(Number(id));
      navigate('/');
    }
  };

  const handleRemoveSong = async (songId: number) => {
    if (!playlist) return;
    await removeFromPlaylist(Number(id), songId);
    setPlaylist(prev => prev ? { ...prev, songs: prev.songs.filter(s => s.id !== songId) } : null);
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playPlaylist(playlist.songs);
    }
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading...</div>;
  if (!playlist) return null;

  return (
    <div className="p-8 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left">
        <div className="w-52 h-52 bg-gradient-to-br from-green-500 to-emerald-900 shadow-2xl rounded-lg flex items-center justify-center shrink-0">
          <span className="text-6xl">🎵</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold uppercase tracking-wider text-white mb-2">Playlist</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{playlist.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-400 text-sm">
            <span className="text-white font-bold">User</span>
            <span>•</span>
            <span>{playlist.songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          <Play className="w-6 h-6 fill-black text-black ml-1" />
        </button>
        
        <button 
          onClick={handleDelete}
          className="p-3 text-neutral-400 hover:text-red-500 transition-colors"
          title="Delete Playlist"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        <div className="grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_1fr_1fr_1fr_40px] gap-4 px-4 py-2 text-neutral-400 text-sm border-b border-white/10 uppercase tracking-wider font-medium">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="hidden md:flex justify-end"><Clock className="w-4 h-4" /></span>
          <span></span>
        </div>

        {playlist.songs.map((song, index) => (
          <div 
            key={song.id}
            className="group grid grid-cols-[16px_1fr_40px] md:grid-cols-[16px_1fr_1fr_1fr_40px] gap-4 px-4 py-3 rounded-md hover:bg-white/10 transition-colors items-center text-sm text-neutral-400 hover:text-white"
          >
            <span className="text-center group-hover:hidden">{index + 1}</span>
            <button 
              onClick={() => playPlaylist(playlist.songs, index)}
              className="hidden group-hover:block text-white"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>

            <div className="flex items-center gap-3 overflow-hidden">
              {song.thumbnail && <img src={song.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />}
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-medium truncate">{song.title}</span>
                <span className="text-neutral-500 group-hover:text-neutral-300 truncate">{song.artist}</span>
              </div>
            </div>

            <span className="truncate hidden md:block">{song.album || '-'}</span>
            
            <span className="text-right font-mono hidden md:block">{formatTime(song.duration)}</span>

            <div className="relative flex justify-end">
              <button 
                onClick={() => handleRemoveSong(song.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                title="Remove from playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {playlist.songs.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            This playlist is empty. Add songs from your library!
          </div>
        )}
      </div>
    </div>
  );
};
