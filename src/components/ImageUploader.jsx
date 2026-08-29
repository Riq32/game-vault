import { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ImageUploader({ onImageSelect, currentAvatar }) {
  const [mode, setMode] = useState('upload');
  const [preview, setPreview] = useState(currentAvatar || null);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid format. Please use JPG, PNG, WEBP, or GIF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onImageSelect({ type: 'file', data: file });
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    if (val.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i)) {
      setPreview(val);
      onImageSelect({ type: 'url', data: val });
      setError('');
    } else if (val === '') {
      setPreview(null);
      onImageSelect(null);
    } else {
      setError('Please enter a valid direct image URL.');
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setUrlInput('');
    setError('');
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-[var(--color-vault-black)] border border-[var(--color-vault-border)] rounded-2xl p-6">
      <div className="flex gap-4 mb-6 border-b border-[var(--color-vault-border)] pb-4">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest pb-2 transition-colors ${
            mode === 'upload' ? 'text-[var(--color-neon-cyan)] border-b-2 border-[var(--color-neon-cyan)]' : 'text-[var(--color-text-secondary)] hover:text-white'
          }`}
        >
          <Upload size={16} /> Local File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest pb-2 transition-colors ${
            mode === 'url' ? 'text-[var(--color-neon-cyan)] border-b-2 border-[var(--color-neon-cyan)]' : 'text-[var(--color-text-secondary)] hover:text-white'
          }`}
        >
          <LinkIcon size={16} /> External URL
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm font-bold mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {preview ? (
        <div className="relative group rounded-full overflow-hidden border-2 border-[var(--color-vault-border)] bg-black w-32 h-32 mx-auto flex items-center justify-center">
          <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
            <button type="button" onClick={clearSelection} className="text-red-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {mode === 'upload' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-vault-border)] rounded-xl p-8 flex flex-col items-center justify-center text-[var(--color-text-secondary)] hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] transition-colors cursor-pointer bg-[var(--color-vault-surface)]/50"
            >
              <ImageIcon size={32} className="mb-3" />
              <p className="font-bold text-sm uppercase tracking-widest">Select Visual Data</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={ALLOWED_TYPES.join(',')} className="hidden" />
            </div>
          ) : (
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="Paste direct image URL..."
              className="w-full bg-[var(--color-vault-surface)] border border-[var(--color-vault-border)] text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-neon-cyan)]"
            />
          )}
        </div>
      )}
    </div>
  );
}