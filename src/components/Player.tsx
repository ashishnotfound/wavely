import React, { useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, Music, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { formatTime } from '../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

export const Player = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    nextSong, 
    prevSong, 
    progress, 
    duration, 
    seek, 
    volume, 
    setVolume,
    shuffle,
    toggleShuffle,
    repeat,
    toggleRepeat,
    mediaRef,
    currentSongUrl
  } = usePlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const fullScreenProgressBarRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement>) => {
    e.stopPropagation();
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  if (!currentSong) return null;

  const isVideo = currentSong.media_type === 'video';
  const mediaSrc = currentSongUrl || undefined;

  return (
    <>
      {/* Media Element - Always mounted */}
      {isVideo ? (
        <div className={`fixed transition-all duration-300 z-40 bg-black overflow-hidden ${
          isExpanded 
            ? 'inset-0 flex items-center justify-center' 
            : 'bottom-[90px] right-4 w-80 aspect-video shadow-lg rounded-lg border border-white/10'
        }`}>
          <video 
            ref={mediaRef as React.RefObject<HTMLVideoElement>} 
            src={mediaSrc}
            className="w-full h-full object-contain"
            autoPlay={isPlaying}
            onClick={() => !isExpanded && setIsExpanded(true)}
          />
          {/* Collapse button for video in full screen */}
          {isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 z-50"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}
        </div>
      ) : (
        <audio 
          ref={mediaRef as React.RefObject<HTMLAudioElement>} 
          src={mediaSrc} 
          autoPlay={isPlaying}
        />
      )}

      {/* Full Screen Player Overlay (for Audio) */}
      <AnimatePresence>
        {isExpanded && !isVideo && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-neutral-900 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
              <button onClick={() => setIsExpanded(false)} className="text-white hover:text-neutral-300">
                <ChevronDown className="w-8 h-8" />
              </button>
              <div className="text-center">
                <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Now Playing</p>
                <p className="text-sm font-bold text-white truncate max-w-[200px]">{currentSong.album || 'Unknown Album'}</p>
              </div>
              <div className="w-8" /> {/* Spacer */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-md aspect-square bg-neutral-800 rounded-lg shadow-2xl overflow-hidden relative group">
                {currentSong.thumbnail ? (
                  <img src={currentSong.thumbnail} alt={currentSong.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <Music className="w-32 h-32" />
                  </div>
                )}
              </div>
            </div>

            {/* Controls Section */}
            <div className="p-8 pb-12 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{currentSong.title}</h2>
                  <p className="text-lg text-neutral-400">{currentSong.artist}</p>
                </div>
                {/* Like button could go here */}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div 
                  ref={fullScreenProgressBarRef}
                  className="h-1.5 bg-neutral-700 rounded-full cursor-pointer group"
                  onClick={(e) => handleSeek(e, fullScreenProgressBarRef)}
                >
                  <div 
                    className="h-full bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
                    style={{ width: `${(progress / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-between max-w-md mx-auto">
                <button 
                  onClick={toggleShuffle}
                  className={`text-neutral-400 hover:text-white transition-colors ${shuffle ? 'text-green-500' : ''}`}
                >
                  <Shuffle className="w-6 h-6" />
                </button>
                
                <button onClick={prevSong} className="text-white hover:text-neutral-300 transition-colors">
                  <SkipBack className="w-8 h-8" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                
                <button onClick={nextSong} className="text-white hover:text-neutral-300 transition-colors">
                  <SkipForward className="w-8 h-8" />
                </button>
                
                <button 
                  onClick={toggleRepeat}
                  className={`text-neutral-400 hover:text-white transition-colors ${repeat !== 'off' ? 'text-green-500' : ''}`}
                >
                  <Repeat className="w-6 h-6" />
                  {repeat === 'one' && <span className="absolute text-[10px] top-0 right-0 font-bold">1</span>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Full Screen Controls Overlay */}
      <AnimatePresence>
        {isExpanded && isVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end pb-12 px-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
          >
            <div className="pointer-events-auto w-full max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{currentSong.title}</h2>
                  <p className="text-xl text-neutral-300 drop-shadow-md">{currentSong.artist}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div 
                  ref={fullScreenProgressBarRef}
                  className="h-1.5 bg-white/30 rounded-full cursor-pointer group backdrop-blur-sm"
                  onClick={(e) => handleSeek(e, fullScreenProgressBarRef)}
                >
                  <div 
                    className="h-full bg-white rounded-full relative group-hover:bg-green-500 transition-colors"
                    style={{ width: `${(progress / duration) * 100}%` }}
                  >
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-white/80 font-mono drop-shadow">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-12">
                 <button onClick={prevSong} className="text-white hover:text-neutral-300 transition-colors drop-shadow-md">
                  <SkipBack className="w-8 h-8" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg"
                >
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                
                <button onClick={nextSong} className="text-white hover:text-neutral-300 transition-colors drop-shadow-md">
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Player Bar - Hide when expanded */}
      {!isExpanded && (
        <div 
          className="fixed bottom-0 left-0 right-0 h-[90px] bg-neutral-900 border-t border-white/10 px-4 flex items-center justify-between z-50 cursor-pointer hover:bg-neutral-800/50 transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          {/* Song Info */}
          <div className="flex items-center gap-4 w-[30%]">
            {currentSong.thumbnail ? (
              <img src={currentSong.thumbnail} alt={currentSong.title} className="w-14 h-14 rounded object-cover" />
            ) : (
              <div className="w-14 h-14 bg-neutral-800 rounded flex items-center justify-center text-neutral-500">
                <Music className="w-6 h-6" />
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-white font-medium truncate">{currentSong.title}</h4>
              <p className="text-neutral-400 text-sm truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center w-[40%]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-6 mb-2">
              <button 
                onClick={toggleShuffle}
                className={`text-neutral-400 hover:text-white transition-colors ${shuffle ? 'text-green-500' : ''}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              
              <button onClick={prevSong} className="text-neutral-400 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              
              <button onClick={nextSong} className="text-neutral-400 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
              
              <button 
                onClick={toggleRepeat}
                className={`text-neutral-400 hover:text-white transition-colors ${repeat !== 'off' ? 'text-green-500' : ''}`}
              >
                <Repeat className="w-4 h-4" />
                {repeat === 'one' && <span className="absolute text-[8px] top-0 right-0">1</span>}
              </button>
            </div>

            <div className="w-full flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span>{formatTime(progress)}</span>
              <div 
                ref={progressBarRef}
                className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer group"
                onClick={(e) => handleSeek(e, progressBarRef)}
              >
                <div 
                  className="h-full bg-white rounded-full group-hover:bg-green-500 transition-colors relative"
                  style={{ width: `${(progress / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                </div>
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-end gap-3 w-[30%]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-neutral-400 hover:text-white">
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="w-24 h-1 bg-neutral-700 rounded-full cursor-pointer group">
              <div 
                className="h-full bg-white rounded-full group-hover:bg-green-500 transition-colors"
                style={{ width: `${volume * 100}%` }}
              />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <button onClick={() => setIsExpanded(true)} className="ml-2 text-neutral-400 hover:text-white">
               <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};


