import React, { useState } from 'react';
import { Play, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Song, useData } from '../context/DataContext';
import { usePlayer } from '../context/PlayerContext';
import { EditSongModal } from './EditSongModal';

interface SongCardProps {
  song: Song;
}

export const SongCard = ({ song }: SongCardProps) => {
  const { playSong } = usePlayer();
  const { playlists, addToPlaylist, deleteSong } = useData();
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    playSong(song);
  };

  const handleAddToPlaylist = (playlistId: number) => {
    addToPlaylist(playlistId, song.id);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      await deleteSong(song.id);
    }
    setShowMenu(false);
  };

  return (
    <>
      <div className="group relative bg-neutral-800/50 hover:bg-neutral-800 rounded-lg p-4 transition-all duration-300 ease-out hover:shadow-2xl hover:scale-[1.02]">
        <div className="relative aspect-square mb-4 rounded-md overflow-hidden">
          {song.thumbnail ? (
            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-neutral-500">
              <span className="text-4xl">🎵</span>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
            <button 
              onClick={handlePlay}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-500 ease-out"
            >
              <Play className="w-5 h-5 fill-black text-black ml-1" />
            </button>
          </div>
        </div>

        <h3 className="text-white font-medium truncate mb-1">{song.title}</h3>
        <p className="text-neutral-400 text-sm truncate">{song.artist}</p>

        {/* Context Menu Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black/60 rounded-full hover:bg-black/80 text-white backdrop-blur-sm"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-800 border border-white/10 rounded-lg shadow-xl z-50 py-1">
                <button 
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Song
                </button>
                
                <div className="h-px bg-white/10 my-1" />
                
                <div className="px-4 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">Add to Playlist</div>
                {playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors truncate"
                  >
                    {playlist.name}
                  </button>
                ))}

                <div className="h-px bg-white/10 my-1" />

                <button 
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Song
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <EditSongModal 
          song={song} 
          onClose={() => setShowEdit(false)} 
        />
      )}
    </>
  );
};
