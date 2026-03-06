import React from 'react';
import { Sidebar } from './Sidebar';
import { Player } from './Player';
import { MobileNav } from './MobileNav';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-neutral-900/50 relative pb-36 md:pb-24">
        {children}
      </main>

      {/* Player (Global) */}
      <Player />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};
