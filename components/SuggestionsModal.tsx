import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './Icons';
import { storage } from '../utils/storageUtils';

interface SuggestionsModalProps {
  onClose: () => void;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ onClose }) => {
  const [notes, setNotes] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    storage.getItem('pixelBoard_suggestions').then(saved => {
      if (saved) setNotes(saved);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) storage.setItem('pixelBoard_suggestions', notes);
  }, [notes, isLoaded]);

  const handleDownload = () => {
    const content = "NOTAS Y SUGERENCIAS - PIXEL BOARD\n\n" + notes;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mis_sugerencias_pixel_board.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="pixel-panel w-full max-w-2xl flex flex-col gap-6 max-h-[90vh]">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white neon-text uppercase tracking-tighter">Mis Notas y Sugerencias</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <p className="text-sm text-white/60 italic">
            Escribe aquí tus ideas, errores encontrados o cosas que te gustaría mejorar en la aplicación. Se guardará automáticamente.
          </p>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="pixel-input w-full flex-1 min-h-[300px] resize-none text-lg leading-relaxed p-4"
            placeholder="Escribe tus sugerencias aquí..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button onClick={onClose} className="pixel-button flex-1 p-3 bg-white/10 hover:bg-white/20">
            Cerrar
          </button>
          <button onClick={handleDownload} className="pixel-button flex-1 p-3 bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2">
            <DownloadIcon />
            Descargar .txt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;
