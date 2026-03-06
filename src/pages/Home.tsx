import React, { useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { SongCard } from '../components/SongCard';
import { motion } from 'framer-motion';

export const Home = () => {
  const { songs, history, continueListening, loading, fetchHistory, fetchContinueListening } = useData();

  useEffect(() => {
    fetchHistory();
    fetchContinueListening();
  }, [fetchHistory, fetchContinueListening]);

  const recentlyAdded = useMemo(() => {
    return [...songs].sort((a, b) => b.created_at - a.created_at).slice(0, 5);
  }, [songs]);

  const mostPlayed = useMemo(() => {
    return [...songs].sort((a, b) => b.play_count - a.play_count).slice(0, 5);
  }, [songs]);

  // Use history from context instead of calculating from songs
  const recentlyPlayed = useMemo(() => {
    // Deduplicate history by song id
    const unique = new Set();
    const result = [];
    for (const song of history) {
      if (!unique.has(song.id)) {
        unique.add(song.id);
        result.push(song);
      }
    }
    return result.slice(0, 5);
  }, [history]);

  if (loading) {
    return <div className="p-8 text-neutral-500">Loading...</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-8 pb-32 space-y-12">
      {/* Hero Section */}
      <section>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-neutral-400">Here's what you've been listening to.</p>
      </section>

      {/* Continue Listening */}
      {continueListening.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Continue Listening</h2>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {continueListening.map(song => (
              <motion.div key={song.id} variants={item}>
                <SongCard song={song} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Recently Played</h2>
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {recentlyPlayed.map(song => (
              <motion.div key={song.id} variants={item}>
                <SongCard song={song} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Most Played */}
      {mostPlayed.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Most Played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mostPlayed.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Recently Added</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recentlyAdded.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {songs.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold text-white mb-4">Your library is empty</h3>
          <p className="text-neutral-400 mb-8">Upload some music to get started.</p>
        </div>
      )}
    </div>
  );
};
