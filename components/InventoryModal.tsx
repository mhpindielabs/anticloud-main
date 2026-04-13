import React from 'react';
import { BoardItem } from '../types';
import { XIcon, TrashIcon, PlusIcon } from './Icons';

interface InventoryModalProps {
  inventory: BoardItem[];
  onClose: () => void;
  onAddItem: (item: BoardItem) => void;
  onRemoveItem: (id: string) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ 
  inventory, 
  onClose, 
  onAddItem, 
  onRemoveItem 
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="pixel-panel w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl text-white font-mono uppercase tracking-wider flex items-center gap-2">
            Inventario Local
          </h2>
          <button onClick={onClose} className="pixel-button p-1 bg-red-600">
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {inventory.length === 0 ? (
            <div className="text-center py-12 text-white/50 font-mono italic">
              El inventario está vacío. Guarda elementos desde la pizarra.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {inventory.map((item) => (
                <div 
                  key={item.id} 
                  className="pixel-panel p-2 bg-slate-800/50 hover:bg-slate-700/50 transition-colors group relative"
                >
                  <div className="aspect-square flex items-center justify-center bg-slate-900/50 rounded p-2 mb-2">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt="Item" 
                        className="max-w-full max-h-full object-contain pixelated"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-[10px] text-white/70 overflow-hidden text-center">
                        {item.text || item.type}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center gap-1">
                    <button 
                      onClick={() => onAddItem(item)}
                      className="pixel-button p-1 bg-green-600 flex-1 text-[10px]"
                      title="Añadir a la pizarra"
                    >
                      <PlusIcon />
                    </button>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="pixel-button p-1 bg-red-600"
                      title="Eliminar del inventario"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-slate-900/30 text-[10px] text-white/50 font-mono text-center">
          Los elementos se guardan localmente en tu navegador.
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
