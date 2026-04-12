import React from 'react';
import DraggableItem from './DraggableItem';
import ParticleSystem from './ParticleSystem';
import { Board, BoardItem, ItemType } from '../types';
import { GRID_SIZE } from '../constants';

interface BoardCanvasProps {
  viewportRef: React.RefObject<HTMLDivElement>;
  boardRef: React.RefObject<HTMLDivElement>;
  activeBoard: Board;
  zoom: number;
  isGridVisible: boolean;
  isMultiSelectMode: boolean;
  handleWheel: (e: React.WheelEvent) => void;
  handlePanMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlePanTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleUpdateItem: (updatedItem: BoardItem, selectedItemIds: string[]) => void;
  handleDeleteItem: (id: string, setSelectedItemIds: any, setSelectedItemId: any) => void;
  handleDuplicateItem: (id: string) => void;
  handleStartEditItem: (item: BoardItem) => void;
  handleSendItemToBack: (id: string) => void;
  onSaveToInventory: (item: BoardItem) => void;
  isMobileMode: boolean;
  selectedItemId: string | null;
  selectedItemIds: string[];
  setSelectedItemId: (id: string | null) => void;
  setSelectedItemIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectionRect: { x: number; y: number; width: number; height: number; } | null;
  multiSelectRect: { x: number; y: number; width: number; height: number; } | null;
}

const BoardCanvas: React.FC<BoardCanvasProps> = ({
  viewportRef,
  boardRef,
  activeBoard,
  zoom,
  isGridVisible,
  isMultiSelectMode,
  handleWheel,
  handlePanMouseDown,
  handlePanTouchStart,
  handleUpdateItem,
  handleDeleteItem,
  handleDuplicateItem,
  handleStartEditItem,
  handleSendItemToBack,
  onSaveToInventory,
  isMobileMode,
  selectedItemId,
  selectedItemIds,
  setSelectedItemId,
  setSelectedItemIds,
  selectionRect,
  multiSelectRect
}) => {
  return (
    <div 
      ref={viewportRef} 
      id="tutorial-viewport"
      className={`w-full h-full overflow-auto ${isMultiSelectMode ? 'cursor-crosshair' : 'cursor-grab'}`}
      onWheel={handleWheel}
      onMouseDown={handlePanMouseDown}
      onTouchStart={handlePanTouchStart}
    >
      <div 
        ref={boardRef}
        className={`relative ${activeBoard.screenFilter ? `filter-${activeBoard.screenFilter}` : ''}`} 
        style={{ 
          width: `${activeBoard.width || 3000}px`, 
          height: `${activeBoard.height || 2000}px`,
          backgroundColor: '#000000',
          backgroundImage: activeBoard.backgroundUrl ? `url(${activeBoard.backgroundUrl})` : 'none',
          backgroundRepeat: activeBoard.backgroundMode === 'tile' ? 'repeat' : 'no-repeat',
          backgroundSize: activeBoard.backgroundMode === 'expand' ? '100% 100%' : 'auto',
          backgroundPosition: activeBoard.backgroundMode === 'center' ? 'center' : 'top left',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        {activeBoard.particles && activeBoard.particles !== 'none' && (
          <ParticleSystem 
            type={activeBoard.particles} 
            width={activeBoard.width || 3000} 
            height={activeBoard.height || 2000} 
          />
        )}
        {isGridVisible && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              backgroundImage: `
                linear-gradient(to right, var(--pixel-border-color) 1px, transparent 1px),
                linear-gradient(to bottom, var(--pixel-border-color) 1px, transparent 1px)
              `,
              opacity: 0.2
            }}
          />
        )}
        {activeBoard.items.map(item => (
          <DraggableItem 
            key={item.id} 
            item={item} 
            onUpdate={(updated) => handleUpdateItem(updated, selectedItemIds)} 
            onDelete={(id) => handleDeleteItem(id, setSelectedItemIds, setSelectedItemId)} 
            onDuplicate={handleDuplicateItem}
            onEdit={handleStartEditItem}
            onSendToBack={handleSendItemToBack}
            onSaveToInventory={onSaveToInventory}
            boardRef={boardRef}
            zoom={zoom}
            snapToGrid={isGridVisible}
            gridSize={GRID_SIZE}
            isMobileMode={isMobileMode}
            isSelected={item.id === selectedItemId || selectedItemIds.includes(item.id)}
            selectedItemIds={selectedItemIds}
            onSelect={(id) => {
              if (selectedItemIds.includes(id)) return;
              
              const item = activeBoard.items.find(i => i.id === id);
              if (item?.groupId) {
                const groupItemIds = activeBoard.items
                  .filter(i => i.groupId === item.groupId)
                  .map(i => i.id);
                setSelectedItemIds(groupItemIds);
                setSelectedItemId(null);
              } else {
                setSelectedItemId(id);
                setSelectedItemIds([]);
              }
            }}
          />
        ))}
        {selectionRect && (
          <div
            className="absolute pointer-events-none shadow-[0_0_10px_var(--pixel-highlight-color)]"
            style={{
              left: selectionRect.x,
              top: selectionRect.y,
              width: selectionRect.width,
              height: selectionRect.height,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '2px dashed var(--pixel-highlight-color)',
            }}
          />
        )}
        {multiSelectRect && (
          <div
            className="absolute pointer-events-none shadow-[0_0_15px_var(--pixel-highlight-color)]"
            style={{
              left: multiSelectRect.x,
              top: multiSelectRect.y,
              width: multiSelectRect.width,
              height: multiSelectRect.height,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid var(--pixel-highlight-color)',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BoardCanvas;
