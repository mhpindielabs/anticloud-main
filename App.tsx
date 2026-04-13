import React, { useRef, useEffect } from 'react';
import { ItemType, TitleCollectionKey, TextboxCollectionKey, AssetCategory } from './types';
import { FONT_FACES, THEMES } from './constants';
import AddElementModal from './components/AddElementModal';
import AddChordModal from './components/AddChordModal';
import AddHarmonizationModal from './components/AddHarmonizationModal';
import EditImagesModal from './components/EditImagesModal';

import TextEditModal from './components/TextEditModal';
import BoardSettingsModal from './components/BoardSettingsModal';
import LayersModal from './components/LayersModal';
import InventoryModal from './components/InventoryModal';
import SuggestionsModal from './components/SuggestionsModal';
import TutorialGuide, { TUTORIAL_STEPS } from './components/TutorialGuide';
import {
  PlusIcon, MusicIcon, LayersIcon, FileIcon, SettingsIcon, CameraIcon,
  BoardNextIcon, SelectIcon, SmartphoneIcon, HelpIcon, SuggestionIcon, GridIcon
} from './components/Icons';
import Modal from './components/Modal';
import Toolbar from './components/Toolbar';
import BoardCanvas from './components/BoardCanvas';

import { useBoards } from './hooks/useBoards';
import { useAssets } from './hooks/useAssets';
import { useUIState } from './hooks/useUIState';
import { useCanvasEvents } from './hooks/useCanvasEvents';
import { useBoardActions } from './hooks/useBoardActions';

const App: React.FC = () => {
  const {
    isBoardsLoaded,
    boards, setBoards, activeBoardIndex, setActiveBoardIndex, activeBoard,
    handleUpdateItem, handleDeleteItem, handleDuplicateItem,
    handleSendItemToBack, handleReorderItem, handleGroupItems, handleUngroupItems, handleSendItemToBoard, handleAddBoard, handleRemoveBoard,
    handleUpdateBoardSettings, handleAddConnection, handleRemoveConnection
  } = useBoards();

  const {
    isInitializing, titleImages, setTitleImages, textboxImages, setTextboxImages,
    pixelImages, setPixelImages, spriteImages, setSpriteImages,
    activeTitleKey, setActiveTitleKey, activeTextboxKey, setActiveTextboxKey,
    activeCounterKey, setActiveCounterKey,
    activeTimerKey, setActiveTimerKey,
    activeCheckboxKey, setActiveCheckboxKey,
    activePlainTextKey, setActivePlainTextKey,
    activePixelKey, setActivePixelKey, activeSpriteKey, setActiveSpriteKey,
    pixelSizeMultiplier, setPixelSizeMultiplier, spriteSizeMultiplier, setSpriteSizeMultiplier,
    renamePixelCategory, renameSpriteCategory
  } = useAssets();

  const {
    isUILoaded,
    zoom, setZoom, isGridVisible, setIsGridVisible, isCapturing, setIsCapturing,
    showScreenshotOptions, setShowScreenshotOptions, isSelectingArea, setIsSelectingArea,
    selectionRect, setSelectionRect, isMobileMode, setIsMobileMode,
    selectedItemId, setSelectedItemId, selectedItemIds, setSelectedItemIds,
    isMultiSelectMode, setIsMultiSelectMode, multiSelectRect, setMultiSelectRect,
    clipboard, setClipboard, activeCategory, handleCategoryEnter, handleCategoryLeave,
    activeModal, setActiveModal, editingItem, setEditingItem,
    inventory, setInventory,
    activeThemeIndex, setActiveThemeIndex, isTutorialActive, setIsTutorialActive,
    tutorialStep, setTutorialStep,
    connectingFromId, setConnectingFromId,
    connectionPointerCoord, setConnectionPointerCoord
  } = useUIState();

  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const disketteInputRef = useRef<HTMLInputElement>(null);

  const handleExportToDisk = () => {
    const data = {
      boards,
      pixelImages,
      spriteImages,
      inventory,
      activeThemeIndex
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixel_board_save_${Date.now()}.anticloud`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFromDisk = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);

        if (parsed.boards) setBoards(parsed.boards);
        if (parsed.pixelImages) setPixelImages(parsed.pixelImages);
        if (parsed.spriteImages) setSpriteImages(parsed.spriteImages);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.activeThemeIndex !== undefined) setActiveThemeIndex(parsed.activeThemeIndex);

        alert("¡Tierra Firme sincronizada! Datos del disquete (.anticloud) cargados con éxito.");
      } catch (error) {
        console.error("ANTI_CLOUD Error al leer disquete:", error);
        alert("El disquete (.anticloud) está dañado o es ilegible.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const {
    handleAddItem, handleAddCounter, handleAddTimer, handleAddFile, handleAddCheckbox, handleAddPlainText, handleAddBox, handleBatchAddItems, handleDuplicateSelected, handleDeleteSelected, handleCopySelected,
    handlePaste, handleBackgroundFileChange, handleSaveAssetImages,
    handleScreenshot, handleStartEditItem
  } = useBoardActions({
    boards, setBoards, activeBoardIndex, viewportRef, boardRef, zoom,
    pixelSizeMultiplier, spriteSizeMultiplier, setActiveModal,
    selectedItemIds, setSelectedItemIds, clipboard, setClipboard,
    setIsCapturing, setEditingItem, setTitleImages, setTextboxImages,
    setPixelImages, setSpriteImages
  });

  const {
    handleWheel, handlePanMouseDown, handlePanTouchStart, handleSelectionMouseDown,
    handleMoveStart, handleMoveEnd, handlePanMouseMove, handlePanMouseUp,
    handlePanTouchMove, handlePanTouchEnd, handleSelectionMouseMove,
    handleSelectionMouseUp, handleMultiSelectMouseMove, handleMultiSelectMouseUp
  } = useCanvasEvents({
    zoom, setZoom, viewportRef, boardRef, isMultiSelectMode, isGridVisible,
    setSelectedItemId, setSelectedItemIds, setMultiSelectRect, setSelectionRect,
    setIsSelectingArea, activeBoard, onScreenshot: handleScreenshot
  });

  const handleThemeChange = () => {
    setActiveThemeIndex(prevIndex => (prevIndex + 1) % THEMES.length);
  };

  const handleStartTutorial = () => {
    setTutorialStep(0);
    setIsTutorialActive(true);
  };

  const handleAddItemWithLog = (type: ItemType, imageUrl?: string, extraProps?: any) => {
    console.log('Adding item from App:', { type, imageUrl, extraProps });
    handleAddItem(type, imageUrl, extraProps);
  };

  const handleNextTutorialStep = () => {
    setTutorialStep(prev => {
      const nextStep = prev + 1;
      if (nextStep >= TUTORIAL_STEPS.length) {
        handleSkipTutorial();
        return prev;
      }
      return nextStep;
    });
  };

  const handlePrevTutorialStep = () => {
    setTutorialStep(prev => Math.max(0, prev - 1));
  };

  const handleSkipTutorial = () => {
    setIsTutorialActive(false);
    localStorage.setItem('pixelBoard_tutorialCompleted', 'true');
  };

  useEffect(() => {
    if (!isTutorialActive) return;

    // Map tutorial steps to toolbar categories that need to be open
    const stepToCategory: Record<number, string | null> = {
      1: 'add',
      2: 'add',
      3: 'add',
      4: 'add',
      5: 'add',
      7: 'music',
      8: 'music',
      10: 'config',
      11: 'config',
      13: 'config',
    };

    const category = stepToCategory[tutorialStep];
    if (category) {
      handleCategoryEnter(category);
    } else {
      handleCategoryLeave();
    }
  }, [tutorialStep, isTutorialActive, handleCategoryEnter, handleCategoryLeave]);

  // Ctrl mantenido invierte el estado de la cuadrícula; al soltar, vuelve al original
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' && !e.repeat) {
        setIsGridVisible(prev => !prev);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsGridVisible(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsGridVisible]);

  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener('mousemove', handlePanMouseMove);
      document.removeEventListener('mouseup', handlePanMouseUp);
      document.removeEventListener('touchmove', handlePanTouchMove);
      document.removeEventListener('touchend', handlePanTouchEnd);
      document.removeEventListener('mousemove', handleSelectionMouseMove);
      document.removeEventListener('mouseup', handleSelectionMouseUp);
      document.removeEventListener('mousemove', handleMultiSelectMouseMove);
      document.removeEventListener('mouseup', handleMultiSelectMouseUp);
    };
    return cleanup;
  }, [handlePanMouseMove, handlePanMouseUp, handlePanTouchMove, handlePanTouchEnd, handleSelectionMouseMove, handleSelectionMouseUp, handleMultiSelectMouseMove, handleMultiSelectMouseUp]);

  return (
    <div 
      className="relative w-screen h-screen bg-black overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {(isInitializing || !isBoardsLoaded || !isUILoaded) && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <p className="text-4xl font-bold text-white neon-text animate-pulse">Cargando Tierra Firme...</p>
        </div>
      )}
      {isCapturing && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <p className="text-4xl text-white animate-pulse">Capturando pizarra...</p>
        </div>
      )}

      <input
        type="file"
        ref={backgroundInputRef}
        className="hidden"
        onChange={handleBackgroundFileChange}
        accept="image/png, image/jpeg, image/gif"
      />
      <input
        type="file"
        ref={disketteInputRef}
        className="hidden"
        onChange={handleImportFromDisk}
        accept=".anticloud"
      />

      {isSelectingArea && (
        <div
          className="absolute inset-0 z-30 cursor-crosshair bg-black/30"
          onMouseDown={handleSelectionMouseDown}
        />
      )}

      <BoardCanvas
        viewportRef={viewportRef}
        boardRef={boardRef}
        activeBoard={activeBoard}
        zoom={zoom}
        isGridVisible={isGridVisible}
        isMultiSelectMode={isMultiSelectMode}
        handleWheel={handleWheel}
        handlePanMouseDown={handlePanMouseDown}
        handlePanTouchStart={handlePanTouchStart}
        handleUpdateItem={handleUpdateItem}
        handleDeleteItem={handleDeleteItem}
        handleDuplicateItem={handleDuplicateItem}
        handleStartEditItem={handleStartEditItem}
        handleSendItemToBack={handleSendItemToBack}
        onSaveToInventory={(item) => {
          setInventory(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, { ...item }];
          });
        }}
        isMobileMode={isMobileMode}
        selectedItemId={selectedItemId}
        selectedItemIds={selectedItemIds}
        setSelectedItemId={setSelectedItemId}
        setSelectedItemIds={setSelectedItemIds}
        selectionRect={selectionRect}
        multiSelectRect={multiSelectRect}
        connectingFromId={connectingFromId}
        setConnectingFromId={setConnectingFromId}
        connectionPointerCoord={connectionPointerCoord}
        setConnectionPointerCoord={setConnectionPointerCoord}
        handleAddConnection={handleAddConnection}
        handleRemoveConnection={handleRemoveConnection}
      />

      <Toolbar
        isMobileMode={isMobileMode}
        activeCategory={activeCategory}
        handleCategoryEnter={handleCategoryEnter}
        handleCategoryLeave={handleCategoryLeave}
        setActiveCategory={handleCategoryEnter}
        setActiveModal={setActiveModal}
        backgroundInputRef={backgroundInputRef}
        isGridVisible={isGridVisible}
        setIsGridVisible={setIsGridVisible}
        handleThemeChange={handleThemeChange}
        showScreenshotOptions={showScreenshotOptions}
        setShowScreenshotOptions={setShowScreenshotOptions}
        handleScreenshot={handleScreenshot}
        setIsSelectingArea={setIsSelectingArea}
        activeBoardIndex={activeBoardIndex}
        boardsCount={boards.length}
        setActiveBoardIndex={setActiveBoardIndex}
        handleAddBoard={handleAddBoard}
        handleRemoveBoard={handleRemoveBoard}
        isMultiSelectMode={isMultiSelectMode}
        setIsMultiSelectMode={setIsMultiSelectMode}
        selectedItemIds={selectedItemIds}
        handleDuplicateSelected={handleDuplicateSelected}
        handleDeleteSelected={handleDeleteSelected}
        handleCopySelected={handleCopySelected}
        handlePaste={handlePaste}
        handleGroupItems={handleGroupItems}
        handleUngroupItems={handleUngroupItems}
        handleAddCounter={handleAddCounter}
        handleAddTimer={handleAddTimer}
        handleAddFile={handleAddFile}
        handleAddCheckbox={handleAddCheckbox}
        handleAddPlainText={handleAddPlainText}
        handleAddBox={handleAddBox}
        setIsMobileMode={setIsMobileMode}
        handleStartTutorial={handleStartTutorial}
        handleExportToDisk={handleExportToDisk}
        disketteInputRef={disketteInputRef}
      />



      {/* Modals */}
      {activeModal === 'addCounter' && (
        <AddElementModal
          title="Añadir Contador"
          onClose={() => setActiveModal(null)}
          images={titleImages[activeCounterKey]}
          showCollectionSelector={true}
          collectionKeys={['x1/2', 'x1']}
          activeCollectionKey={activeCounterKey}
          onCollectionChange={(key) => setActiveCounterKey(key as TitleCollectionKey)}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Counter, imageUrl)}
          onEditImages={(key) => setActiveModal({ type: 'editTitleImages', key })}
        />
      )}

      {activeModal === 'addTimer' && (
        <AddElementModal
          title="Añadir Cronómetro / Temporizador"
          onClose={() => setActiveModal(null)}
          images={titleImages[activeTimerKey]}
          showCollectionSelector={true}
          collectionKeys={['x1/2', 'x1']}
          activeCollectionKey={activeTimerKey}
          onCollectionChange={(key) => setActiveTimerKey(key as TitleCollectionKey)}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Timer, imageUrl, {
            timerMode: 'chrono',
            timerValue: 0,
            timerInitialValue: 0,
            isTimerRunning: false,
            text: '00:00'
          })}
          onEditImages={(key) => setActiveModal({ type: 'editTitleImages', key })}
        />
      )}

      {activeModal === 'addFile' && (
        <AddElementModal
          title="Añadir Archivo Inteligente"
          onClose={() => setActiveModal(null)}
          images={titleImages['x1']}
          showCollectionSelector={false}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.File, imageUrl, {
            fileName: 'archivo.txt',
            fileContent: '',
            text: 'Archivo'
          })}
        />
      )}

      {activeModal === 'addCheckbox' && (
        <AddElementModal
          title="Añadir Checkbox"
          onClose={() => setActiveModal(null)}
          images={titleImages[activeCheckboxKey]}
          showCollectionSelector={true}
          collectionKeys={['x1/2', 'x1']}
          activeCollectionKey={activeCheckboxKey}
          onCollectionChange={(key) => setActiveCheckboxKey(key as TitleCollectionKey)}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Checkbox, imageUrl, {
            checked: false,
            text: 'Tarea'
          })}
          onEditImages={(key) => setActiveModal({ type: 'editTitleImages', key })}
        />
      )}

      {activeModal === 'addPlainText' && (
        <AddElementModal
          title="Añadir Texto Plano"
          onClose={() => setActiveModal(null)}
          images={titleImages[activePlainTextKey]}
          showCollectionSelector={true}
          collectionKeys={['x1/2', 'x1', 'x2', 'x3', 'x4']}
          activeCollectionKey={activePlainTextKey}
          onCollectionChange={(key) => setActivePlainTextKey(key as TitleCollectionKey)}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.PlainText, imageUrl, {
            text: 'Texto',
            textColor: '#FFFFFF',
            textShadow: false
          })}
          onEditImages={(key) => setActiveModal({ type: 'editTitleImages', key })}
        />
      )}

      {activeModal === 'addTitle' && (
        <AddElementModal
          title="Añadir Título"
          onClose={() => setActiveModal(null)}
          images={titleImages[activeTitleKey]}
          showCollectionSelector={true}
          collectionKeys={['x1/2', 'x1', 'x2', 'x3', 'x4']}
          activeCollectionKey={activeTitleKey}
          onCollectionChange={(key) => setActiveTitleKey(key as TitleCollectionKey)}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Title, imageUrl)}
          onEditImages={(key) => setActiveModal({ type: 'editTitleImages', key })}
        />
      )}

      {activeModal === 'addTextbox' && (
        <AddElementModal
          title="Añadir Caja de Texto"
          onClose={() => setActiveModal(null)}
          images={textboxImages[activeTextboxKey]}
          showCollectionSelector={true}
          collectionKeys={['x1', 'x4', 'x16']}
          activeCollectionKey={activeTextboxKey}
          onCollectionChange={(key) => setActiveTextboxKey(key as TextboxCollectionKey)}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Textbox, imageUrl)}
          onEditImages={(key) => setActiveModal({ type: 'editTextboxImages', key })}
        />
      )}

      {activeModal === 'addPixel' && (
        <AddElementModal
          title="Añadir Ilustración"
          onClose={() => setActiveModal(null)}
          images={pixelImages[activePixelKey].images}
          collectionKeys={Object.keys(pixelImages)}
          activeCollectionKey={activePixelKey}
          onCollectionChange={(key) => setActivePixelKey(key)}
          collectionNames={Object.fromEntries(Object.entries(pixelImages).map(([k, v]) => [k, (v as AssetCategory).name]))}
          onRenameCollection={renamePixelCategory}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Pixel, imageUrl)}
          onEditImages={(key) => setActiveModal({ type: 'editPixelImages', key })}
          showSizeMultiplier={true}
          sizeMultiplier={pixelSizeMultiplier}
          onSizeMultiplierChange={setPixelSizeMultiplier}
        />
      )}

      {activeModal === 'addSprite' && (
        <AddElementModal
          title="Añadir Sprite"
          onClose={() => setActiveModal(null)}
          images={spriteImages[activeSpriteKey].images}
          collectionKeys={Object.keys(spriteImages)}
          activeCollectionKey={activeSpriteKey}
          onCollectionChange={(key) => setActiveSpriteKey(key)}
          collectionNames={Object.fromEntries(Object.entries(spriteImages).map(([k, v]) => [k, (v as AssetCategory).name]))}
          onRenameCollection={renameSpriteCategory}
          onAdd={(imageUrl) => handleAddItemWithLog(ItemType.Sprite, imageUrl)}
          onEditImages={(key) => setActiveModal({ type: 'editSpriteImages', key })}
          showSizeMultiplier={true}
          sizeMultiplier={spriteSizeMultiplier}
          onSizeMultiplierChange={setSpriteSizeMultiplier}
        />
      )}

      {activeModal === 'addChord' && (
        <AddChordModal
          collections={titleImages}
          onClose={() => setActiveModal(null)}
          onAdd={(chordName, imageUrl, color, shadowColor) => {
            handleAddItem(ItemType.Music, imageUrl, {
              text: chordName,
              textColor: color,
              textShadowColor: shadowColor,
              textShadow: true
            });
            setActiveModal(null);
          }}
        />
      )}

      {activeModal === 'addHarmonization' && (
        <AddHarmonizationModal
          collections={titleImages}
          onClose={() => setActiveModal(null)}
          onAdd={(chords) => {
            const items = chords.map(chord => ({
              type: ItemType.Music,
              imageUrl: chord.imageUrl,
              extraProps: {
                text: chord.name,
                textColor: chord.color,
                textShadowColor: chord.shadowColor,
                textShadow: true
              }
            }));
            handleBatchAddItems(items);
            setActiveModal(null);
          }}
        />
      )}


      {activeModal && typeof activeModal === 'object' && activeModal.type === 'editTitleImages' && (
        <EditImagesModal
          onClose={() => setActiveModal(activeModal.returnTo || 'addTitle')}
          onApply={(newImages) => handleSaveAssetImages({ type: 'title', key: activeModal.key }, newImages)}
          images={titleImages[activeModal.key]}
          type="title"
          title={`Editar Imágenes de Título (${activeModal.key})`}
        />
      )}

      {activeModal && typeof activeModal === 'object' && activeModal.type === 'editTextboxImages' && (
        <EditImagesModal
          onClose={() => setActiveModal(activeModal.returnTo || 'addTextbox')}
          onApply={(newImages) => handleSaveAssetImages({ type: 'textbox', key: activeModal.key }, newImages)}
          images={textboxImages[activeModal.key]}
          type="textbox"
          title={`Editar Imágenes de Caja de Texto (${activeModal.key})`}
        />
      )}

      {activeModal && typeof activeModal === 'object' && activeModal.type === 'editPixelImages' && (
        <EditImagesModal
          onClose={() => setActiveModal('addPixel')}
          onApply={(newImages) => handleSaveAssetImages({ type: 'pixel', key: activeModal.key }, newImages)}
          images={pixelImages[activeModal.key]?.images || []}
          type="pixel"
          title={`Editar Imágenes de Ilustración (${activeModal.key})`}
        />
      )}

      {activeModal && typeof activeModal === 'object' && activeModal.type === 'editSpriteImages' && (
        <EditImagesModal
          onClose={() => setActiveModal('addSprite')}
          onApply={(newImages) => handleSaveAssetImages({ type: 'sprite', key: activeModal.key }, newImages)}
          images={spriteImages[activeModal.key]?.images || []}
          type="sprite"
          title={`Editar Imágenes de Sprite (${activeModal.key})`}
        />
      )}

      {activeModal === 'boardSettings' && (
        <BoardSettingsModal
          board={activeBoard}
          onClose={() => setActiveModal(null)}
          onSave={handleUpdateBoardSettings}
        />
      )}

      {activeModal === 'boardSettings' && (
        <BoardSettingsModal
          board={activeBoard}
          onClose={() => setActiveModal(null)}
          onSave={handleUpdateBoardSettings}
        />
      )}

      {activeModal === 'suggestions' && (
        <SuggestionsModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'layers' && (
        <LayersModal
          items={activeBoard.items}
          onClose={() => setActiveModal(null)}
          onReorder={handleReorderItem}
          onDelete={(id) => handleDeleteItem(id, setSelectedItemIds, setSelectedItemId)}
          onSelect={(id) => {
            setSelectedItemId(id);
            setSelectedItemIds([]);
          }}
          selectedItemIds={selectedItemIds}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          inventory={inventory}
          onClose={() => setActiveModal(null)}
          onAddItem={(item) => {
            const { id, ...rest } = item;
            handleAddItem(item.type, item.imageUrl, { ...rest });
            setActiveModal(null);
          }}
          onRemoveItem={(id) => setInventory(prev => prev.filter(i => i.id !== id))}
        />
      )}

      {editingItem && (
        <TextEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            handleUpdateItem(updated, selectedItemIds);
            setEditingItem(null);
          }}
          boardsLength={boards.length}
          activeBoardIndex={activeBoardIndex}
          onSendToBoard={handleSendItemToBoard}
          titleImages={titleImages}
          textboxImages={textboxImages}
        />
      )}

      {isTutorialActive && (
        <TutorialGuide
          step={tutorialStep}
          onNext={handleNextTutorialStep}
          onPrev={handlePrevTutorialStep}
          onSkip={handleSkipTutorial}
        />
      )}
    </div>
  );
};

export default App;
