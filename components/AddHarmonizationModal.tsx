import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { TitleImageCollections, TitleCollectionKey } from '../types';

interface AddHarmonizationModalProps {
  collections: TitleImageCollections;
  onAdd: (chords: { name: string; color: string; shadowColor: string; imageUrl: string }[]) => void;
  onClose: () => void;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_ALIASES: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const SCALES = [
  { 
    name: 'Mayor', 
    intervals: [0, 2, 4, 5, 7, 9, 11], 
    types: ['', 'm', 'm', '', '', 'm', 'dim'],
    roman: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII°']
  },
  { 
    name: 'Menor Natural', 
    intervals: [0, 2, 3, 5, 7, 8, 10], 
    types: ['m', 'dim', '', 'm', 'm', '', ''],
    roman: ['I', 'II°', 'III', 'IV', 'V', 'VI', 'VII']
  },
  { 
    name: 'Menor Armónica', 
    intervals: [0, 2, 3, 5, 7, 8, 11], 
    types: ['m', 'dim', 'aug', 'm', '', '', 'dim'],
    roman: ['I', 'II°', 'III+', 'IV', 'V', 'VI', 'VII°']
  },
];

const BASIC_COLORS = [
  '#FFFFFF', '#FFF1E8', '#FFCCAA', '#C2C3C7', '#5F574F', '#000000',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436', '#29ADFF', '#83769C',
  '#FF77A8', '#7E2553', '#AB5236', '#1D2B53', '#008751',
];

type HarmonizationMode = 'chords' | 'notes' | 'roman';

const AddHarmonizationModal: React.FC<AddHarmonizationModalProps> = ({ collections, onAdd, onClose }) => {
  const [selectedRoot, setSelectedRoot] = useState<string>('C');
  const [selectedScaleIndex, setSelectedScaleIndex] = useState<number>(0);
  const [useFlats, setUseFlats] = useState(false);
  const [selectedSize, setSelectedSize] = useState<TitleCollectionKey>('x1');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [selectedShadowColor, setSelectedShadowColor] = useState<string>('#FFFFFF');
  const [mode, setMode] = useState<HarmonizationMode>('chords');

  const getNoteName = (index: number) => {
    const note = NOTES[index % 12];
    if (useFlats && NOTE_ALIASES[note]) {
      return NOTE_ALIASES[note];
    }
    return note;
  };

  const currentHarmonization = useMemo(() => {
    const rootIndex = NOTES.indexOf(selectedRoot);
    const scale = SCALES[selectedScaleIndex];
    
    return scale.intervals.map((interval, i) => {
      if (mode === 'roman') return scale.roman[i];
      
      const noteName = getNoteName(rootIndex + interval);
      if (mode === 'notes') return noteName;
      
      const type = scale.types[i];
      return `${noteName}${type}`;
    });
  }, [selectedRoot, selectedScaleIndex, useFlats, mode]);

  const handleAdd = () => {
    const availableImages = collections[selectedSize];
    // We want index 4 (5th image) for the first one, and index 0 (1st image) for the rest.
    // We use fallback to the first available if they don't exist.
    const firstImage = availableImages[4] || availableImages[0] || '';
    const otherImage = availableImages[0] || '';

    if (firstImage || otherImage) {
      const chords = currentHarmonization.map((name, i) => ({
        name,
        color: selectedColor,
        shadowColor: selectedShadowColor,
        imageUrl: i === 0 ? firstImage : otherImage
      }));
      onAdd(chords);
    }
  };

  return (
    <Modal onClose={onClose} title="Insertar Armonización / Escala" className="max-w-4xl">
      <div className="p-6 flex flex-col gap-8 max-h-[85vh] overflow-y-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Configuration */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm uppercase font-bold opacity-70">Modo de Inserción</label>
              <div className="flex gap-1">
                {(['chords', 'notes', 'roman'] as HarmonizationMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`pixel-button flex-1 py-2 text-xs uppercase ${mode === m ? 'pixel-button-active' : ''}`}
                  >
                    {m === 'chords' ? 'Acordes' : m === 'notes' ? 'Notas' : 'Grados'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm uppercase font-bold opacity-70">Nota Raíz</label>
              <div className="flex flex-wrap gap-1">
                {NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => setSelectedRoot(note)}
                    className={`pixel-button px-3 py-1 text-sm ${selectedRoot === note ? 'pixel-button-active' : ''}`}
                  >
                    {useFlats && NOTE_ALIASES[note] ? NOTE_ALIASES[note] : note}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useFlats} 
                  onChange={(e) => setUseFlats(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs uppercase opacity-70">Usar Bemoles (♭)</span>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm uppercase font-bold opacity-70">Escala / Modo</label>
              <div className="flex flex-col gap-1">
                {SCALES.map((scale, index) => (
                  <button
                    key={scale.name}
                    onClick={() => setSelectedScaleIndex(index)}
                    className={`pixel-button py-2 text-left px-4 ${selectedScaleIndex === index ? 'pixel-button-active' : ''}`}
                  >
                    {scale.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm uppercase font-bold opacity-70">Tamaño</label>
                <div className="flex gap-1">
                  {(['x1/2', 'x1'] as TitleCollectionKey[]).map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`pixel-button flex-1 py-1 text-xs ${selectedSize === size ? 'pixel-button-active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-sm uppercase font-bold opacity-70">Colores</label>
                 <div className="flex gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <input 
                        type="color" 
                        value={selectedColor} 
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-8 h-8 cursor-pointer"
                        title="Color de Texto"
                      />
                      <span className="text-[8px] uppercase">Texto</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <input 
                        type="color" 
                        value={selectedShadowColor} 
                        onChange={(e) => setSelectedShadowColor(e.target.value)}
                        className="w-8 h-8 cursor-pointer"
                        title="Color de Sombra"
                      />
                      <span className="text-[8px] uppercase">Sombra</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col gap-4">
            <label className="text-sm uppercase font-bold opacity-70">Vista Previa de los 7 Acordes</label>
            <div className="pixel-panel bg-black/40 p-4 flex flex-col gap-2 min-h-[300px]">
              {currentHarmonization.map((chord, i) => (
                <div 
                  key={i} 
                  className="bg-white border-2 border-black p-2 flex items-center justify-between"
                >
                  <span className="text-xs opacity-50 font-mono">[{i + 1}]</span>
                  <span 
                    className="text-xl font-bold"
                    style={{ 
                      color: selectedColor,
                      textShadow: `1px 1px ${selectedShadowColor}, -1px -1px ${selectedShadowColor}, 1px -1px ${selectedShadowColor}, -1px 1px ${selectedShadowColor}`
                    }}
                  >
                    {chord}
                  </span>
                  <div className="w-4" />
                </div>
              ))}
            </div>
            <p className="text-[10px] opacity-50 italic">
              Se insertarán 7 elementos independientes en una fila.
            </p>
          </div>
        </div>

      </div>
      <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/20">
        <button onClick={onClose} className="pixel-button px-6 py-2 bg-red-700">
          Cancelar
        </button>
        <button onClick={handleAdd} className="pixel-button px-10 py-2 bg-green-700 text-lg">
          Insertar Armonización
        </button>
      </div>
    </Modal>
  );
};

export default AddHarmonizationModal;
