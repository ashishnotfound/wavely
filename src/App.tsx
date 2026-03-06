import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Search } from './pages/Search';
import { Playlist } from './pages/Playlist';
import { PlayerProvider } from './context/PlayerContext';
import { DataProvider } from './context/DataContext';

export default function App() {
  return (
    <Router>
      <DataProvider>
        <PlayerProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/search" element={<Search />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </PlayerProvider>
      </DataProvider>
    </Router>
  );
}
