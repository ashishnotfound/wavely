import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { SongCard } from '../components/SongCard';
import { Upload, SortAsc, Clock, PlayCircle } from 'lucide-react';

export const Library = () => {
  const { songs, uploadSong, loading } = useData();
  const [sortBy, setSortBy] = useState<'newest' | 'mostPlayed' | 'alphabetical'>('newest');
  const [isUploading, setIsUploading] = useState(false);

  const sortedSongs = useMemo(() => {
    const sorted = [...songs];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.created_at - a.created_at);
    } else if (sortBy === 'mostPlayed') {
      sorted.sort((a, b) => b.play_count - a.play_count);
    } else if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [songs, sortBy]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      try {
        await uploadSong(e.target.files[0]);
      } catch (error) {
        alert('Upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (loading) return <div className="p-8 text-neutral-500">Loading...</div>;

  return (
    <div className="p-8 pb-32 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Library</h1>
          <p className="text-neutral-400">{songs.length} songs</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <button 
              className={`flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-5 h-5" />
              {isUploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setSortBy('newest')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${sortBy === 'newest' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <Clock className="w-4 h-4" />
          Recently Added
        </button>
        <button 
          onClick={() => setSortBy('mostPlayed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${sortBy === 'mostPlayed' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <PlayCircle className="w-4 h-4" />
          Most Played
        </button>
        <button 
          onClick={() => setSortBy('alphabetical')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${sortBy === 'alphabetical' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
        >
          <SortAsc className="w-4 h-4" />
          A-Z
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sortedSongs.map(song => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      {sortedSongs.length === 0 && (
        <div className="text-center py-20 text-neutral-500">
          No songs found. Upload some music to get started!
        </div>
      )}
    </div>
  );
};
