import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Plus, Music } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Sidebar = () => {
  const { playlists, createPlaylist } = useData();

  const handleCreatePlaylist = () => {
    const name = prompt('Playlist Name:');
    if (name) createPlaylist(name);
  };

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col h-[calc(100vh-90px)]">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-green-500 flex items-center gap-2">
          <Music className="w-8 h-8" />
          Wavely
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`
          }
        >
          <Home className="w-5 h-5" />
          Home
        </NavLink>
        <NavLink 
          to="/search" 
          className={({ isActive }) => 
            `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`
          }
        >
          <Search className="w-5 h-5" />
          Search
        </NavLink>
        <NavLink 
          to="/library" 
          className={({ isActive }) => 
            `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`
          }
        >
          <Library className="w-5 h-5" />
          Library
        </NavLink>

        <div className="pt-8 pb-4 px-4">
          <div className="flex items-center justify-between text-neutral-400 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Playlists</span>
            <button onClick={handleCreatePlaylist} className="hover:text-white transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[40vh]">
            {playlists.map(playlist => (
              <NavLink
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className={({ isActive }) => 
                  `block px-4 py-2 text-sm rounded-lg truncate transition-colors ${isActive ? 'text-white bg-white/5' : 'text-neutral-400 hover:text-white'}`
                }
              >
                {playlist.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};
