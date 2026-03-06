import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Music } from 'lucide-react';

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10 z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around p-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-white' : 'text-neutral-500'}`
          }
        >
          <Home className="w-6 h-6" />
          Home
        </NavLink>
        <NavLink 
          to="/search" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-white' : 'text-neutral-500'}`
          }
        >
          <Search className="w-6 h-6" />
          Search
        </NavLink>
        <NavLink 
          to="/library" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-white' : 'text-neutral-500'}`
          }
        >
          <Library className="w-6 h-6" />
          Library
        </NavLink>
      </div>
    </nav>
  );
};
