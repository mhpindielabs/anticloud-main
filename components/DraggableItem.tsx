import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BoardItem, ItemType } from '../types';
import { DeleteIcon, EditIcon, DuplicateIcon, SendToBackIcon, DpadUpIcon, DpadDownIcon, DpadLeftIcon, DpadRightIcon, PlayIcon, PauseIcon, ResetIcon, CopyIcon, PasteIcon, DownloadIcon, FileIcon, LinkIcon } from './Icons';

interface DraggableItemProps {
  item: BoardItem;
  onUpdate: (item: BoardItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (item: BoardItem) => void;
  onSendToBack: (id: string) => void;
  onSaveToInventory: (item: BoardItem) => void;
  boardRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  snapToGrid: boolean;
  gridSize: number;
  isMobileMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  selectedItemIds: string[];
  connectingFromId?: string | null;
  onConnectStart?: (id: string) => void;
  onConnectComplete?: (id: string) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, onUpdate, onDelete, onDuplicate, onEdit, onSendToBack, onSaveToInventory, boardRef, zoom, snapToGrid, gridSize, isMobileMode, isSelected, onSelect, selectedItemIds, connectingFromId, onConnectStart, onConnectComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(item.imageUrl);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const moveTimeoutRef = useRef<number | null>(null);
  const moveIntervalRef = useRef<number | null>(null);
  const itemRef = useRef(item);

  useEffect(() => {
    itemRef.current = item;
    if (item.type === ItemType.SuperTitle && item.secondaryImageUrl && item.blinkInterval) {
      const intervalId = setInterval(() => {
        setCurrentImageUrl(prev => prev === item.imageUrl ? item.secondaryImageUrl! : item.imageUrl);
      }, item.blinkInterval);
      return () => clearInterval(intervalId);
    } else {
      setCurrentImageUrl(item.imageUrl);
    }
  }, [item]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent dragging when clicking on a button inside the item
    if ((e.target as HTMLElement).closest('button')) return;

    if (connectingFromId && connectingFromId !== item.id) {
      if (onConnectComplete) {
        onConnectComplete(item.id);
        return;
      }
    }

    onSelect(item.id);

    if (!dragRef.current) return;

    // Store original positions for multi-drag
    if (isSelected && selectedItemIds.length > 1) {
      selectedItemIds.forEach(id => {
        const el = document.querySelector(`[data-item-id="${id}"]`) as HTMLElement;
        if (el) {
          el.setAttribute('data-original-x', el.style.left.replace('px', ''));
          el.setAttribute('data-original-y', el.style.top.replace('px', ''));
        }
      });
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const { x, y } = dragRef.current.getBoundingClientRect();
    offsetRef.current = { x: startX - x, y: startY - y };

    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !boardRef.current) return;

    e.preventDefault();
    const boardRect = boardRef.current.getBoundingClientRect();
    let newX = (e.clientX - boardRect.left - offsetRef.current.x) / zoom;
    let newY = (e.clientY - boardRect.top - offsetRef.current.y) / zoom;

    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    const boardWidth = 3000;
    const boardHeight = 2000;

    newX = Math.max(0, Math.min(newX, boardWidth - item.width));
    newY = Math.max(0, Math.min(newY, boardHeight - item.height));

    const dx = newX - item.x;
    const dy = newY - item.y;

    if (dragRef.current) {
      dragRef.current.style.left = `${newX}px`;
      dragRef.current.style.top = `${newY}px`;
    }

    // Multi-drag visual update
    if (isSelected && selectedItemIds.length > 1) {
       selectedItemIds.forEach(id => {
         if (id !== item.id) {
           const el = document.querySelector(`[data-item-id="${id}"]`) as HTMLElement | null;
           if (el) {
             const originalX = parseFloat(el.getAttribute('data-original-x') || el.style.left || '0');
             const originalY = parseFloat(el.getAttribute('data-original-y') || el.style.top || '0');
             el.style.left = `${originalX + dx}px`;
             el.style.top = `${originalY + dy}px`;
             
             // Update any DOM lines connected to these multi-selected items
             const elWidth = parseFloat(el.style.width || '200');
             const elHeight = parseFloat(el.style.height || '100');
             const elCenterX = originalX + dx + elWidth / 2;
             const elCenterY = originalY + dy + elHeight / 2;
             
             document.querySelectorAll(`line[data-from="${id}"]`).forEach(line => {
               line.setAttribute('x1', elCenterX.toString());
               line.setAttribute('y1', elCenterY.toString());
             });
             document.querySelectorAll(`line[data-to="${id}"]`).forEach(line => {
               line.setAttribute('x2', elCenterX.toString());
               line.setAttribute('y2', elCenterY.toString());
             });
           }
         }
       });
    }

    // Direct DOM connection updates for this specific item rendering efficiency
    const centerX = newX + item.width / 2;
    const centerY = newY + item.height / 2;
    
    document.querySelectorAll(`line[data-from="${item.id}"]`).forEach(line => {
      line.setAttribute('x1', centerX.toString());
      line.setAttribute('y1', centerY.toString());
    });
    
    document.querySelectorAll(`line[data-to="${item.id}"]`).forEach(line => {
      line.setAttribute('x2', centerX.toString());
      line.setAttribute('y2', centerY.toString());
    });
    
  }, [isDragging, zoom, gridSize, snapToGrid, item, isSelected, selectedItemIds]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging || !boardRef.current) return;

    setIsDragging(false);
    const boardRect = boardRef.current.getBoundingClientRect();
    let finalX = (e.clientX - boardRect.left - offsetRef.current.x) / zoom;
    let finalY = (e.clientY - boardRect.top - offsetRef.current.y) / zoom;

    if (snapToGrid) {
      finalX = Math.round(finalX / gridSize) * gridSize;
      finalY = Math.round(finalY / gridSize) * gridSize;
    }

    const boardWidth = 3000;
    const boardHeight = 2000;

    finalX = Math.max(0, Math.min(finalX, boardWidth - item.width));
    finalY = Math.max(0, Math.min(finalY, boardHeight - item.height));

    // Prevent position update if position hasn't changed to avoid re-render
    if (item.x !== finalX || item.y !== finalY) {
      onUpdate({ ...item, x: finalX, y: finalY });
    }
  }, [isDragging, boardRef, item, onUpdate, zoom, snapToGrid, gridSize]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleMoveText = useCallback((dx: number, dy: number) => {
    const currentItem = itemRef.current;
    onUpdate({
      ...currentItem,
      textOffsetX: (currentItem.textOffsetX || 0) + dx,
      textOffsetY: (currentItem.textOffsetY || 0) + dy,
    });
  }, [onUpdate]);

  const handleMoveTextEnd = useCallback(() => {
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
    }
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }, []);

  const handleMoveTextStart = useCallback((dx: number, dy: number) => {
    handleMoveTextEnd(); // Clear previous timers
    handleMoveText(dx, dy); // Initial move

    moveTimeoutRef.current = window.setTimeout(() => {
      moveIntervalRef.current = window.setInterval(() => {
        handleMoveText(dx, dy);
      }, 50); // Fast interval for accelerated movement
    }, 300); // Delay before acceleration starts
  }, [handleMoveText, handleMoveTextEnd]);

  useEffect(() => {
    // Cleanup timers on component unmount
    return () => {
      handleMoveTextEnd();
    };
  }, [handleMoveTextEnd]);

  const textShadowStyle = (item.textShadow ?? true)
    ? `2px 2px ${item.textShadowColor || '#FFFFFF'}, -2px -2px ${item.textShadowColor || '#FFFFFF'}, 2px -2px ${item.textShadowColor || '#FFFFFF'}, -2px 2px ${item.textShadowColor || '#FFFFFF'}`
    : 'none';

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (item.type === ItemType.Timer && item.isTimerRunning) {
      const intervalId = setInterval(() => {
        const currentItem = itemRef.current;
        const newValue = currentItem.timerMode === 'chrono'
          ? (currentItem.timerValue || 0) + 1
          : (currentItem.timerValue || 0) - 1;

        onUpdate({
          ...currentItem,
          timerValue: newValue,
          text: formatTime(newValue)
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [item.type, item.isTimerRunning, onUpdate]);

  const handleTimerToggle = () => {
    onUpdate({ ...item, isTimerRunning: !item.isTimerRunning });
  };

  const handleTimerReset = () => {
    const resetValue = item.timerMode === 'chrono' ? 0 : (item.timerInitialValue || 0);
    onUpdate({
      ...item,
      timerValue: resetValue,
      isTimerRunning: false,
      text: formatTime(resetValue)
    });
  };

  const handleCopyText = useCallback(() => {
    if (item.text) {
      navigator.clipboard.writeText(item.text);
    }
  }, [item.text]);

  const handlePasteText = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onUpdate({ ...item, text: text, textFragments: undefined });
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, [item, onUpdate]);

  const handleDownloadFile = useCallback(() => {
    if (item.fileContent && item.fileName) {
      const blob = new Blob([item.fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [item.fileContent, item.fileName]);

  const isTextEditable = item.type === ItemType.Title || item.type === ItemType.Textbox || item.type === ItemType.SuperTitle || item.type === ItemType.Counter || item.type === ItemType.Timer || item.type === ItemType.File || item.type === ItemType.Checkbox || item.type === ItemType.PlainText;
  const isMusicItem = item.type === ItemType.Music;
  const isCounterItem = item.type === ItemType.Counter;
  const isTimerItem = item.type === ItemType.Timer;
  const isCheckboxItem = item.type === ItemType.Checkbox;
  const isPlainTextItem = item.type === ItemType.PlainText;

  const handleCheckboxToggle = useCallback(() => {
    onUpdate({ ...item, checked: !item.checked });
  }, [item, onUpdate]);

  const handleCounterChange = useCallback((delta: number) => {
    const currentItem = itemRef.current;
    const newValue = (currentItem.counterValue || 0) + delta;
    onUpdate({
      ...currentItem,
      counterValue: newValue,
      text: String(newValue),
    });
  }, [onUpdate]);

  const transposeMusic = useCallback((direction: 'up' | 'down') => {
    const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    const currentText = itemRef.current.text;

    // Check for Roman Numerals first
    const romanMatch = currentText.match(/^([ivIV]+)(.*)$/);
    if (romanMatch) {
      const numeral = romanMatch[1].toUpperCase();
      const suffix = romanMatch[2];
      const foundIndex = ROMAN_UPPER.indexOf(numeral);

      if (foundIndex !== -1) {
        const nextIndex = (foundIndex + (direction === 'up' ? 1 : -1) + 7) % 7;
        onUpdate({ ...itemRef.current, text: ROMAN_UPPER[nextIndex] + suffix });
        return;
      }
    }

    // Check for Chords/Notes
    const noteMatch = currentText.match(/^([A-G][#b]?)(.*)$/);
    if (noteMatch) {
      const root = noteMatch[1];
      const suffix = noteMatch[2];

      let index = SHARP_NOTES.indexOf(root);
      let useFlats = false;
      if (index === -1) {
        index = FLAT_NOTES.indexOf(root);
        useFlats = true;
      }

      if (index !== -1) {
        const nextIndex = (index + (direction === 'up' ? 1 : -1) + 12) % 12;
        const nextRoot = useFlats ? FLAT_NOTES[nextIndex] : SHARP_NOTES[nextIndex];
        onUpdate({ ...itemRef.current, text: nextRoot + suffix });
      }
    }
  }, [onUpdate]);

  const controlClasses = isMobileMode ? (isSelected ? 'opacity-100' : 'opacity-0') : 'opacity-0 group-hover:opacity-100';

  const neonGlowStyle = item.neonGlow
    ? { filter: `drop-shadow(0 0 10px ${item.neonColor || '#00ff00'}) drop-shadow(0 0 20px ${item.neonColor || '#00ff00'})` }
    : {};

  const effectClasses = [
    item.neonGlow ? 'neon-text' : '',
    item.floating ? 'effect-floating' : '',
    item.glitch ? 'effect-glitch' : '',
    item.rainbow ? 'effect-rainbow' : '',
    item.scanlines ? 'effect-scanlines' : '',
    item.pixelate ? 'effect-pixelate' : '',
    item.shake ? 'effect-shake' : '',
    item.pulse ? 'effect-pulse' : '',
    item.blur ? 'effect-blur' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={dragRef}
      data-item-id={item.id}
      className={`absolute group cursor-grab ${isSelected ? 'ring-4 ring-orange-500 ring-inset' : ''}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        ...neonGlowStyle
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`relative w-full h-full bg-cover bg-center select-none ${isDragging ? 'cursor-grabbing' : ''} ${effectClasses}`}>
        {!isPlainTextItem && <img src={currentImageUrl} alt="draggable item" className="w-full h-full pointer-events-none" referrerPolicy="no-referrer" />}
        <div
          className={`absolute inset-0 p-4 flex items-center justify-center pointer-events-none`}
          style={{
            transform: `translate(${item.textOffsetX || 0}px, ${item.textOffsetY || 0}px)`
          }}
        >
          <div className="flex items-center gap-2">
            {isCheckboxItem && (
              <div
                className={`w-6 h-6 border-2 border-current flex items-center justify-center cursor-pointer pointer-events-auto bg-white/10`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckboxToggle();
                }}
              >
                {item.checked && <div className="w-4 h-4 bg-current" />}
              </div>
            )}
            <p
              className={`whitespace-pre-wrap break-words pixel-text`}
              style={{
                color: item.textColor || '#000000',
                fontFamily: item.fontFamily || 'inherit',
                textShadow: textShadowStyle,
                fontSize: `${item.fontSize || 24}px`,
                lineHeight: 1.2,
                textAlign: item.textAlign || 'center',
                textTransform: item.textTransform || 'none',
                textDecoration: (isCheckboxItem && item.checked) ? 'line-through' : 'none',
                opacity: (isCheckboxItem && item.checked) ? 0.6 : 1,
              }}
            >
              {item.textFragments && item.textFragments.length > 0 ? (
                item.textFragments.map((frag, i) => (
                  <span key={i} style={{ color: frag.color || item.textColor || '#000000' }}>
                    {frag.text}
                  </span>
                ))
              ) : (
                item.text
              )}
            </p>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1 transition-opacity z-10 pointer-events-auto flex-wrap justify-center ${controlClasses}`}>
        {/* Object controls */}
        <div className="flex items-center p-1 gap-1 pixel-box bg-black/70">
          {(isTextEditable || isMusicItem) && (
            <>
              <button onClick={() => onEdit(item)} className="pixel-button p-1 bg-blue-600 hover:bg-blue-500" title="Editar Texto">
                <EditIcon />
              </button>
              <button onClick={handleCopyText} className="pixel-button p-1 bg-amber-600 hover:bg-amber-500" title="Copiar Texto">
                <CopyIcon />
              </button>
              <button onClick={handlePasteText} className="pixel-button p-1 bg-purple-600 hover:bg-purple-500" title="Pegar Texto">
                <PasteIcon />
              </button>
            </>
          )}
          <button onClick={() => onDuplicate(item.id)} className="pixel-button p-1 bg-green-600 hover:bg-green-500" title="Duplicar Elemento">
            <DuplicateIcon />
          </button>
          <button onClick={() => onSendToBack(item.id)} className="pixel-button p-1 bg-indigo-600 hover:bg-indigo-500" title="Enviar al Fondo">
            <SendToBackIcon />
          </button>
          {onConnectStart && (
             <button 
               onMouseDown={(e) => {
                 e.stopPropagation();
                 if (connectingFromId === item.id && onConnectComplete) onConnectComplete(item.id); 
                 else onConnectStart(item.id);
               }} 
               className={`pixel-button p-1 ${connectingFromId === item.id ? 'bg-orange-600 hover:bg-orange-500' : 'bg-cyan-600 hover:bg-cyan-500'}`} 
               title={connectingFromId === item.id ? "Cancelar Enlace" : "Enlazar con..."}
             >
               <LinkIcon />
             </button>
          )}
          <button onClick={() => onSaveToInventory(item)} className="pixel-button p-1 bg-amber-600 hover:bg-amber-500" title="Guardar en Inventario">
            <FileIcon />
          </button>
          <button onClick={() => onDelete(item.id)} className="pixel-button p-1 bg-red-700 hover:bg-red-600" title="Eliminar Elemento">
            <DeleteIcon />
          </button>
        </div>

        {isTimerItem && (
          <div className="flex items-center p-1 gap-1 pixel-box bg-black/70">
            <button onClick={handleTimerToggle} className={`pixel-button p-1 ${item.isTimerRunning ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`} title={item.isTimerRunning ? "Pausar" : "Iniciar"}>
              {item.isTimerRunning ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button onClick={handleTimerReset} className="pixel-button p-1 bg-gray-600 hover:bg-gray-500" title="Reiniciar">
              <ResetIcon />
            </button>
          </div>
        )}
        {item.type === ItemType.File && (
          <div className="flex items-center p-1 gap-1 pixel-box bg-black/70">
            <button onClick={handleDownloadFile} className="pixel-button p-1 bg-green-600 hover:bg-green-500" title="Descargar Archivo">
              <DownloadIcon />
            </button>
          </div>
        )}
      </div>
      {/* Text position controls */}
      {(isTextEditable || isMusicItem) && (
        <>
          <button
            onMouseDown={() => {
              if (isMusicItem) transposeMusic('up');
              else if (isCounterItem) handleCounterChange(1);
              else handleMoveTextStart(0, -2);
            }}
            onMouseUp={handleMoveTextEnd}
            onMouseLeave={handleMoveTextEnd}
            onTouchStart={() => {
              if (isMusicItem) transposeMusic('up');
              else if (isCounterItem) handleCounterChange(1);
              else handleMoveTextStart(0, -2);
            }}
            onTouchEnd={handleMoveTextEnd}
            className={`absolute -top-3 -left-3 z-20 pixel-button p-1 transition-opacity pointer-events-auto ${controlClasses}`}
            title={isMusicItem ? "Subir Tonalidad" : isCounterItem ? "Aumentar Contador" : "Mover Texto Arriba"}
          >
            <DpadUpIcon />
          </button>
          <button
            onMouseDown={() => {
              if (isMusicItem) transposeMusic('down');
              else if (isCounterItem) handleCounterChange(-1);
              else handleMoveTextStart(0, 2);
            }}
            onMouseUp={handleMoveTextEnd}
            onMouseLeave={handleMoveTextEnd}
            onTouchStart={() => {
              if (isMusicItem) transposeMusic('down');
              else if (isCounterItem) handleCounterChange(-1);
              else handleMoveTextStart(0, 2);
            }}
            onTouchEnd={handleMoveTextEnd}
            className={`absolute -bottom-3 -right-3 z-20 pixel-button p-1 transition-opacity pointer-events-auto ${controlClasses}`}
            title={isMusicItem ? "Bajar Tonalidad" : isCounterItem ? "Disminuir Contador" : "Mover Texto Abajo"}
          >
            <DpadDownIcon />
          </button>
          <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 flex items-center gap-1 transition-opacity z-10 pointer-events-auto ${controlClasses}`}>
            <div className="flex items-center p-1 gap-1 pixel-box bg-black/70">
              <button
                onMouseDown={() => handleMoveTextStart(-2, 0)}
                onMouseUp={handleMoveTextEnd}
                onMouseLeave={handleMoveTextEnd}
                onTouchStart={() => handleMoveTextStart(-2, 0)}
                onTouchEnd={handleMoveTextEnd}
                className="pixel-button p-1"
                title="Mover Texto Izquierda"
              >
                <DpadLeftIcon />
              </button>
              <button
                onMouseDown={() => handleMoveTextStart(2, 0)}
                onMouseUp={handleMoveTextEnd}
                onMouseLeave={handleMoveTextEnd}
                onTouchStart={() => handleMoveTextStart(2, 0)}
                onTouchEnd={handleMoveTextEnd}
                className="pixel-button p-1"
                title="Mover Texto Derecha"
              >
                <DpadRightIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DraggableItem;