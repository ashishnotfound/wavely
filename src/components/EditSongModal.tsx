import React, { useState } from 'react';
import { Song, useData } from '../context/DataContext';
import { X } from 'lucide-react';

interface EditSongModalProps {
  song: Song;
  onClose: () => void;
}

export const EditSongModal = ({ song, onClose }: EditSongModalProps) => {
  const { updateSong } = useData();
  const [formData, setFormData] = useState({
    title: song.title,
    artist: song.artist,
    album: song.album || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSong(song.id, formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to update song');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-white/10 rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6">Edit Song</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-neutral-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Artist</label>
            <input 
              type="text" 
              value={formData.artist}
              onChange={e => setFormData({...formData, artist: e.target.value})}
              className="w-full bg-neutral-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Album</label>
            <input 
              type="text" 
              value={formData.album}
              onChange={e => setFormData({...formData, album: e.target.value})}
              className="w-full bg-neutral-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
