import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { SongCard } from '../components/SongCard';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Search = () => {
  const { songs, playlists } = useData();
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return songs.filter(song => 
      song.title.toLowerCase().includes(lowerQuery) || 
      song.artist.toLowerCase().includes(lowerQuery)
    );
  }, [songs, query]);

  const filteredPlaylists = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(lowerQuery)
    );
  }, [playlists, query]);

  return (
    <div className="p-8 pb-32 space-y-8">
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search songs, artists, playlists..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-neutral-800 text-white pl-12 pr-4 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-neutral-500 text-lg"
          autoFocus
        />
      </div>

      {query && (
        <div className="space-y-12">
          {/* Playlists Results */}
          {filteredPlaylists.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPlaylists.map(playlist => (
                  <Link 
                    key={playlist.id} 
                    to={`/playlist/${playlist.id}`}
                    className="block p-6 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors group"
                  >
                    <div className="aspect-square bg-neutral-700 rounded-md mb-4 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300">
                      💿
                    </div>
                    <h3 className="text-white font-bold truncate">{playlist.name}</h3>
                    <p className="text-neutral-400 text-sm">Playlist</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Songs Results */}
          {filteredSongs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredSongs.map(song => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            </section>
          )}

          {filteredSongs.length === 0 && filteredPlaylists.length === 0 && (
            <div className="text-center py-20 text-neutral-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-32 text-neutral-600">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-medium">Find your favorite music</p>
        </div>
      )}
    </div>
  );
};
