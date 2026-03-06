import React from 'react';
import { Sidebar } from './Sidebar';
import { Player } from './Player';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-900/50 relative">
        {children}
      </main>
      <Player />
    </div>
  );
};
