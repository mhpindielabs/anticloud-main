import React, { useState, useEffect } from 'react';
import { BoardItem } from '../types';
import Modal from './Modal';
import CustomSelect from './CustomSelect';
import { FONT_FACES } from '../constants';
import { 
  EditIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CopyIcon,
  PasteIcon,
  PlusIcon,
  DeleteIcon
} from './Icons';
import { TitleImageCollections, TextboxImageCollections, TitleCollectionKey, TextboxCollectionKey, ItemType } from '../types';

interface TextEditModalProps {
  item: BoardItem;
  onSave: (item: BoardItem) => void;
  onClose: () => void;
  boardsLength: number;
  activeBoardIndex: number;
  onSendToBoard: (itemId: string, targetBoardIndex: number) => void;
  titleImages: TitleImageCollections;
  textboxImages: TextboxImageCollections;
}

// A curated palette of basic colors suitable for pixel art.
const BASIC_COLORS = [
  '#FFFFFF', '#FFF1E8', '#FFCCAA', '#C2C3C7', '#5F574F', '#000000',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436', '#29ADFF', '#83769C',
  '#FF77A8', '#7E2553', '#AB5236', '#1D2B53', '#008751',
];

const TextEditModal: React.FC<TextEditModalProps> = ({
  item,
  onSave,
  onClose,
  boardsLength,
  activeBoardIndex,
  onSendToBoard,
  titleImages,
  textboxImages
}) => {
  const [editedItem, setEditedItem] = useState<BoardItem>(item);
  const [activeTab, setActiveTab] = useState<'text' | 'style' | 'effects'>('text');
  const [currentCollection, setCurrentCollection] = useState<string>('x1');
  const [bpm, setBpm] = useState<number>(item.blinkInterval ? Math.round(60000 / item.blinkInterval) : 120);

  useEffect(() => {
    setEditedItem(item);
    if (item.blinkInterval) {
      setBpm(Math.round(60000 / item.blinkInterval));
    }
  }, [item]);

  const handleSave = () => {
    onSave(editedItem);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setEditedItem(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'blinkInterval') {
        const val = Number(value);
        setEditedItem(prev => ({ ...prev, blinkInterval: val }));
        setBpm(Math.round(60000 / val));
    } else {
        setEditedItem(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(e.target.value) || 0;
    setBpm(newBpm);
    if (newBpm > 0) {
      const newInterval = Math.round(60000 / newBpm);
      setEditedItem(prev => ({ ...prev, blinkInterval: newInterval }));
    }
  };
  
  const handleSelectChange = (name: keyof BoardItem, value: string) => {
    setEditedItem(prev => ({ ...prev, [name]: value }));
  };
  
  const handleColorPaletteClick = (name: 'textColor' | 'textShadowColor', color: string) => {
    setEditedItem(prev => ({ ...prev, [name]: color }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setEditedItem(prev => ({
          ...prev,
          fileName: file.name,
          fileContent: content,
          text: file.name
        }));
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = async (name: 'text' | 'counterValue') => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (name === 'counterValue') {
          const val = Number(text);
          if (!isNaN(val)) {
            setEditedItem(prev => ({ ...prev, counterValue: val, text: String(val) }));
          }
        } else {
          setEditedItem(prev => ({ ...prev, text: text, textFragments: undefined }));
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleAddFragment = () => {
    setEditedItem(prev => {
      const fragments = prev.textFragments || [{ text: prev.text || '', color: prev.textColor }];
      return {
        ...prev,
        textFragments: [...fragments, { text: '', color: prev.textColor }]
      };
    });
  };

  const handleRemoveFragment = (index: number) => {
    setEditedItem(prev => {
      const fragments = [...(prev.textFragments || [])];
      fragments.splice(index, 1);
      const newText = fragments.map(f => f.text).join('');
      return {
        ...prev,
        textFragments: fragments.length > 0 ? fragments : undefined,
        text: fragments.length > 0 ? newText : prev.text
      };
    });
  };

  const handleFragmentChange = (index: number, field: 'text' | 'color', value: string) => {
    setEditedItem(prev => {
      const fragments = [...(prev.textFragments || [])];
      fragments[index] = { ...fragments[index], [field]: value };
      const newText = fragments.map(f => f.text).join('');
      return {
        ...prev,
        textFragments: fragments,
        text: newText
      };
    });
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageSelect = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const newWidth = img.naturalWidth;
      const newHeight = img.naturalHeight;
      
      setEditedItem(prev => {
        const boardWidth = 3000;
        const boardHeight = 2000;
        
        // Ensure the item stays within board boundaries after resize
        const newX = Math.max(0, Math.min(prev.x, boardWidth - newWidth));
        const newY = Math.max(0, Math.min(prev.y, boardHeight - newHeight));
        
        return { 
          ...prev, 
          imageUrl,
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY
        };
      });
    };
    img.onerror = () => {
      console.error("Failed to load image for dimensions, using fallback:", imageUrl);
      // Fallback: update image URL even if dimensions couldn't be loaded
      setEditedItem(prev => ({ ...prev, imageUrl }));
    };
    img.src = imageUrl;
  };

  const fontOptions = FONT_FACES.map(font => ({
    value: font,
    label: font.split(',')[0].replace(/'/g, ''),
  }));

  const textShadowStyle = (editedItem.textShadow ?? true)
    ? `2px 2px ${editedItem.textShadowColor || '#FFFFFF'}, -2px -2px ${editedItem.textShadowColor || '#FFFFFF'}, 2px -2px ${editedItem.textShadowColor || '#FFFFFF'}, -2px 2px ${editedItem.textShadowColor || '#FFFFFF'}`
    : 'none';

  const isTitle = item.type === ItemType.Title;
  const collections = isTitle ? titleImages : textboxImages;
  const collectionKeys = isTitle ? ['x1/2', 'x1', 'x2', 'x3', 'x4'] : ['x1', 'x4', 'x16'];

  return (
    <Modal onClose={onClose} title="Editar Elemento" className="max-w-5xl">
      <div className="flex flex-col md:flex-row gap-4 p-4 max-h-[85vh]">
        {/* Left Column: Preview & Tabs */}
        <div className="flex-[1.2] flex flex-col gap-4 overflow-y-auto min-w-0">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl" style={{ textShadow: '2px 2px #0d2b45' }}>Vista Previa</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('text')} 
                        className={`pixel-button px-3 py-1 text-sm ${activeTab === 'text' ? 'pixel-button-active' : ''}`}
                    >
                        Texto
                    </button>
                    <button 
                        onClick={() => setActiveTab('style')} 
                        className={`pixel-button px-3 py-1 text-sm ${activeTab === 'style' ? 'pixel-button-active' : ''}`}
                    >
                        Marco
                    </button>
                    <button 
                        onClick={() => setActiveTab('effects')} 
                        className={`pixel-button px-3 py-1 text-sm ${activeTab === 'effects' ? 'pixel-button-active' : ''}`}
                    >
                        Efectos
                    </button>
                </div>
            </div>

            <div className={`relative w-full h-56 pixel-content-box flex items-center justify-center bg-[#203c56] overflow-hidden ${
                [
                    editedItem.neonGlow ? 'neon-text' : '',
                    editedItem.floating ? 'effect-floating' : '',
                    editedItem.glitch ? 'effect-glitch' : '',
                    editedItem.rainbow ? 'effect-rainbow' : '',
                    editedItem.scanlines ? 'effect-scanlines' : '',
                    editedItem.pixelate ? 'effect-pixelate' : '',
                    editedItem.shake ? 'effect-shake' : '',
                    editedItem.pulse ? 'effect-pulse' : '',
                    editedItem.blur ? 'effect-blur' : '',
                ].filter(Boolean).join(' ')
            }`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    {!editedItem.type || editedItem.type !== ItemType.PlainText ? (
                        <img src={editedItem.imageUrl} alt="" className="w-full h-full object-contain pointer-events-none" referrerPolicy="no-referrer" />
                    ) : null}
                </div>
                <div 
                    className={`absolute inset-0 p-4 flex items-center justify-center pointer-events-none`}
                    style={{
                        transform: `translate(${editedItem.textOffsetX || 0}px, ${editedItem.textOffsetY || 0}px)`,
                        filter: editedItem.neonGlow ? `drop-shadow(0 0 10px ${editedItem.neonColor || '#00ff00'}) drop-shadow(0 0 20px ${editedItem.neonColor || '#00ff00'})` : 'none'
                    }}
                >
                     <div className="flex items-center gap-2">
                        {editedItem.type === ItemType.Checkbox && (
                            <div className={`w-6 h-6 border-2 border-current flex items-center justify-center bg-white/10`}>
                                {editedItem.checked && <div className="w-4 h-4 bg-current" />}
                            </div>
                        )}
                        <p 
                            className={`whitespace-pre-wrap break-words pixel-text`} 
                            style={{ 
                                color: editedItem.textColor || '#000000', 
                                fontFamily: editedItem.fontFamily || 'inherit', 
                                textShadow: textShadowStyle,
                                fontSize: `${editedItem.fontSize || 24}px`,
                                lineHeight: 1.2,
                                textAlign: editedItem.textAlign || 'center',
                                textTransform: editedItem.textTransform || 'none',
                                textDecoration: (editedItem.type === ItemType.Checkbox && editedItem.checked) ? 'line-through' : 'none',
                                opacity: (editedItem.type === ItemType.Checkbox && editedItem.checked) ? 0.6 : 1,
                            }}
                        >
                            {editedItem.textFragments && editedItem.textFragments.length > 0 ? (
                                editedItem.textFragments.map((frag, i) => (
                                    <span key={i} style={{ color: frag.color || editedItem.textColor || '#000000' }}>
                                        {frag.text}
                                    </span>
                                ))
                            ) : (
                                editedItem.text || 'Aa Bb Cc'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {activeTab === 'style' ? (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {collectionKeys.map(key => (
                            <button
                                key={key}
                                onClick={() => setCurrentCollection(key)}
                                className={`pixel-button px-4 py-1 text-lg ${currentCollection === key ? 'pixel-button-active' : ''}`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                    <div className="pixel-panel p-2 bg-black/30">
                        <div className="flex flex-wrap gap-2 justify-center max-h-[180px] overflow-y-auto p-1">
                            {(collections as any)[currentCollection]?.filter((img: any) => img !== null).map((img: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => handleImageSelect(img)}
                                    className={`w-14 h-14 pixel-panel hover:border-white transition-colors overflow-hidden p-0 ${editedItem.imageUrl === img ? 'border-white ring-2 ring-white' : ''}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : activeTab === 'effects' ? (
                <div className="flex flex-col gap-4 p-2 pixel-panel bg-black/30">
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors">
                            <input 
                                type="checkbox" 
                                name="neonGlow"
                                checked={editedItem.neonGlow || false} 
                                onChange={handleInputChange} 
                                className="w-6 h-6" 
                            />
                            <span className="text-xl font-bold text-cyan-400" style={{ textShadow: '0 0 10px #22d3ee' }}>BRILLO NEÓN</span>
                        </label>
                        
                        {editedItem.neonGlow && (
                            <div className="flex flex-col gap-3 pl-9 animate-in fade-in slide-in-from-left-2 mb-2">
                                <label className="text-sm uppercase opacity-70">Color del Neón</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { name: 'Cyan', color: '#00ffff' },
                                        { name: 'Verde', color: '#00ff00' },
                                        { name: 'Rosa', color: '#ff00ff' },
                                        { name: 'Amarillo', color: '#ffff00' },
                                        { name: 'Rojo', color: '#ff0000' },
                                        { name: 'Naranja', color: '#ff8800' },
                                        { name: 'Blanco', color: '#ffffff' }
                                    ].map(opt => (
                                        <button
                                            key={opt.color}
                                            onClick={() => setEditedItem(prev => ({ ...prev, neonColor: opt.color }))}
                                            className={`w-10 h-10 pixel-panel border-2 transition-all ${editedItem.neonColor === opt.color ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            style={{ 
                                                backgroundColor: opt.color,
                                                boxShadow: editedItem.neonColor === opt.color ? `0 0 15px ${opt.color}` : 'none'
                                            }}
                                            title={opt.name}
                                        />
                                    ))}
                                </div>
                                <div className="pixel-input p-1 flex items-center mt-2">
                                    <input 
                                        type="color" 
                                        value={editedItem.neonColor || '#00ff00'} 
                                        onChange={(e) => setEditedItem(prev => ({ ...prev, neonColor: e.target.value }))} 
                                        className="w-8 h-8" 
                                    />
                                    <input 
                                        type="text" 
                                        value={editedItem.neonColor || '#00ff00'} 
                                        onChange={(e) => setEditedItem(prev => ({ ...prev, neonColor: e.target.value }))} 
                                        className="bg-transparent border-none text-white text-sm w-full ml-3 uppercase font-mono"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="floating"
                                    checked={editedItem.floating || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Levitación</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="glitch"
                                    checked={editedItem.glitch || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Error (Glitch)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="rainbow"
                                    checked={editedItem.rainbow || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Arcoíris</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="scanlines"
                                    checked={editedItem.scanlines || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Escaneo</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="pixelate"
                                    checked={editedItem.pixelate || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Pixelado</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="shake"
                                    checked={editedItem.shake || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Sacudida</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="pulse"
                                    checked={editedItem.pulse || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Pulso</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded transition-colors border border-white/5">
                                <input 
                                    type="checkbox" 
                                    name="blur"
                                    checked={editedItem.blur || false} 
                                    onChange={handleInputChange} 
                                    className="w-5 h-5" 
                                />
                                <span className="text-lg">Desenfoque</span>
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <label className="text-lg flex-shrink-0">Enviar a:</label>
                        <select
                            className="pixel-input text-lg flex-grow"
                            value={activeBoardIndex}
                            onChange={(e) => onSendToBoard(editedItem.id, Number(e.target.value))}
                        >
                            {Array.from({ length: boardsLength }).map((_, i) => (
                                <option key={i} value={i} disabled={i === activeBoardIndex}>
                                    Pizarra {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-gray-400 italic">Ajusta la posición del texto usando los botones sobre el elemento en la pizarra.</p>
                </div>
            )}
        </div>
        
        {/* Right Column: Controls */}
        <div className="w-px bg-[var(--pixel-border-color)] hidden md:block"></div>
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-w-0">
            {editedItem.type === ItemType.File && (
              <div className="flex flex-col gap-3 p-2 pixel-panel bg-black/30 mb-1">
                <label className="text-sm uppercase opacity-70">Adjuntar Archivo</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="pixel-input text-sm w-full"
                    accept=".java,.csj,.html,.txt,.js,.ts,.css,.json"
                  />
                  {editedItem.fileName && (
                    <div className="text-xs text-green-400">
                      Archivo actual: {editedItem.fileName}
                    </div>
                  )}
                </div>
              </div>
            )}
            {editedItem.type === ItemType.Timer && (
              <div className="flex flex-col gap-3 p-2 pixel-panel bg-black/30 mb-1">
                <div className="flex flex-col gap-1">
                  <label className="text-sm uppercase opacity-70">Modo del Temporizador</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditedItem(prev => ({ ...prev, timerMode: 'chrono', text: '00:00', timerValue: 0 }))}
                      className={`pixel-button flex-1 py-2 text-sm ${editedItem.timerMode === 'chrono' ? 'pixel-button-active' : ''}`}
                    >
                      Cronómetro
                    </button>
                    <button
                      onClick={() => setEditedItem(prev => ({ ...prev, timerMode: 'timer', text: formatTime(prev.timerInitialValue || 0), timerValue: prev.timerInitialValue || 0 }))}
                      className={`pixel-button flex-1 py-2 text-sm ${editedItem.timerMode === 'timer' ? 'pixel-button-active' : ''}`}
                    >
                      Temporizador
                    </button>
                  </div>
                </div>
                {editedItem.timerMode === 'timer' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm uppercase opacity-70">Valor Inicial (Segundos)</label>
                    <input
                      type="number"
                      name="timerInitialValue"
                      value={editedItem.timerInitialValue ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditedItem(prev => ({ 
                          ...prev, 
                          timerInitialValue: val, 
                          timerValue: val,
                          text: formatTime(val)
                        }));
                      }}
                      className="pixel-input text-2xl w-full"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            )}
            {editedItem.type === ItemType.Counter ? (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm uppercase opacity-70">Valor del Contador</label>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigator.clipboard.writeText(String(editedItem.counterValue ?? 0))}
                      className="pixel-button p-1 text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-500"
                      title="Copiar al portapapeles"
                    >
                      <CopyIcon />
                    </button>
                    <button 
                      onClick={() => handlePaste('counterValue')}
                      className="pixel-button p-1 text-xs flex items-center gap-1 bg-purple-600 hover:bg-purple-500"
                      title="Pegar desde el portapapeles"
                    >
                      <PasteIcon />
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  name="counterValue"
                  value={editedItem.counterValue ?? 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditedItem(prev => ({ ...prev, counterValue: val, text: String(val) }));
                  }}
                  className="pixel-input text-2xl w-full"
                  placeholder="0"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm uppercase opacity-70">Texto y Fragmentos</label>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => navigator.clipboard.writeText(editedItem.text)}
                      className="pixel-button p-1 text-xs flex items-center gap-1 bg-amber-600 hover:bg-amber-500"
                      title="Copiar al portapapeles"
                    >
                      <CopyIcon />
                    </button>
                    <button 
                      onClick={() => handlePaste('text')}
                      className="pixel-button p-1 text-xs flex items-center gap-1 bg-purple-600 hover:bg-purple-500"
                      title="Pegar desde el portapapeles"
                    >
                      <PasteIcon />
                    </button>
                    <button 
                      onClick={handleAddFragment}
                      className="pixel-button p-1 text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-500"
                      title="Añadir fragmento de color"
                    >
                      <PlusIcon /> Color
                    </button>
                  </div>
                </div>
                
                {editedItem.textFragments && editedItem.textFragments.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-1 pixel-panel bg-black/20">
                    {editedItem.textFragments.map((frag, i) => (
                      <div key={i} className="flex gap-2 items-start bg-black/30 p-2 rounded border border-white/5">
                        <div className="flex flex-col gap-1 flex-1">
                          <textarea
                            value={frag.text}
                            onChange={(e) => handleFragmentChange(i, 'text', e.target.value)}
                            className="pixel-input text-sm w-full h-12 resize-none"
                            placeholder="Texto del fragmento..."
                          />
                          <div className="flex items-center gap-2">
                            <input 
                              type="color" 
                              value={frag.color || editedItem.textColor || '#000000'} 
                              onChange={(e) => handleFragmentChange(i, 'color', e.target.value)}
                              className="w-5 h-5 cursor-pointer"
                            />
                            <div className="flex flex-wrap gap-1">
                              {BASIC_COLORS.slice(0, 8).map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleFragmentChange(i, 'color', color)}
                                  className="w-4 h-4 border border-white/10"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveFragment(i)}
                          className="pixel-button p-1 bg-red-700 hover:bg-red-600 self-center"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    name="text"
                    value={editedItem.text}
                    onChange={handleInputChange}
                    className="pixel-input text-lg w-full h-20 resize-y"
                    placeholder="Escribe tu texto aquí..."
                  />
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex flex-col gap-1">
                    <label className="text-sm uppercase opacity-70">Fuente</label>
                    <CustomSelect options={fontOptions} value={editedItem.fontFamily || FONT_FACES[1]} onChange={(val) => handleSelectChange('fontFamily', val)} />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm uppercase opacity-70">Tamaño</label>
                    <input type="number" name="fontSize" value={editedItem.fontSize || 24} onChange={handleInputChange} className="pixel-input text-lg" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-sm uppercase opacity-70">Alineación y Formato</label>
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-1 flex-1">
                            {(['left', 'center', 'right'] as const).map(align => (
                                <button
                                    key={align}
                                    onClick={() => handleSelectChange('textAlign', align)}
                                    className={`pixel-button flex-1 py-1 text-xs ${editedItem.textAlign === align || (!editedItem.textAlign && align === 'center') ? 'pixel-button-active' : ''}`}
                                >
                                    {align === 'left' ? 'Izq' : align === 'right' ? 'Der' : 'Cen'}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer pixel-panel px-2 py-1 bg-black/20">
                            <input 
                                type="checkbox" 
                                checked={editedItem.textTransform === 'uppercase'} 
                                onChange={(e) => handleSelectChange('textTransform', e.target.checked ? 'uppercase' : 'none')} 
                                className="w-4 h-4" 
                            />
                            <span className="text-[10px] font-bold">ABC</span>
                        </label>
                    </div>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-sm uppercase opacity-70">Color de Texto</label>
                    <div className="flex gap-2 items-center">
                        <div className="pixel-input p-1 flex items-center flex-1">
                            <input type="color" name="textColor" value={editedItem.textColor || '#000000'} onChange={handleInputChange} className="w-6 h-6" />
                            <input type="text" name="textColor" value={editedItem.textColor || '#000000'} onChange={handleInputChange} className="bg-transparent border-none text-white text-xs w-full ml-2 uppercase"/>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id="textShadow" name="textShadow" checked={editedItem.textShadow ?? true} onChange={handleInputChange} className="w-5 h-5" />
                            <label htmlFor="textShadow" className="text-xs font-bold">SOMBRA</label>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {BASIC_COLORS.map(color => (
                            <button
                                key={`text-${color}`}
                                type="button"
                                className="w-5 h-5 border border-[var(--pixel-border-color)] cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorPaletteClick('textColor', color)}
                            />
                        ))}
                    </div>
                </div>
                {(editedItem.textShadow ?? true) && (
                     <div className="flex flex-col gap-1 col-span-2 border-t border-white/10 pt-2">
                        <label className="text-sm uppercase opacity-70">Color de Sombra</label>
                        <div className="pixel-input p-1 flex items-center">
                            <input type="color" name="textShadowColor" value={editedItem.textShadowColor || '#FFFFFF'} onChange={handleInputChange} className="w-6 h-6" />
                            <input type="text" name="textShadowColor" value={editedItem.textShadowColor || '#FFFFFF'} onChange={handleInputChange} className="bg-transparent border-none text-white text-xs w-full ml-2 uppercase"/>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {BASIC_COLORS.map(color => (
                                <button
                                    key={`shadow-${color}`}
                                    type="button"
                                    className="w-5 h-5 border border-[var(--pixel-border-color)] cursor-pointer hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorPaletteClick('textShadowColor', color)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {editedItem.type === ItemType.SuperTitle && (
                    <div className="flex flex-col gap-3 col-span-2 border-t border-white/10 pt-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm uppercase opacity-70">Milisegundos ({editedItem.blinkInterval}ms)</label>
                            <input
                                type="range"
                                name="blinkInterval"
                                min="50"
                                max="2000"
                                step="10"
                                value={editedItem.blinkInterval || 500}
                                onChange={handleInputChange}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm uppercase opacity-70">Beats Per Minute (BPM)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={bpm}
                                    onChange={handleBpmChange}
                                    className="pixel-input text-lg w-24"
                                    min="30"
                                    max="1200"
                                />
                                <span className="text-xs opacity-50">Cambia cada {editedItem.blinkInterval}ms</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      <hr className="pixel-divider" />
      <div className="flex justify-center items-center gap-4 px-4 pb-4">
        <button onClick={onClose} className="pixel-button px-6 py-2 flex items-center gap-2 text-2xl bg-red-700 hover:bg-red-600">
          Cancelar
        </button>
        <button onClick={handleSave} className="pixel-button px-6 py-2 flex items-center gap-2 text-2xl bg-green-700 hover:bg-green-600">
          Guardar
        </button>
      </div>
    </Modal>
  );
};

export default TextEditModal;