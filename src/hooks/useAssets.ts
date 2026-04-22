import { useState, useEffect } from 'react';
import { TitleImageCollections, TextboxImageCollections, PixelImageCollections, SpriteImageCollections, TitleCollectionKey, TextboxCollectionKey } from '../types';
import { ASSET_SLOTS, DEFAULT_TITLE_IMAGE_URLS, DEFAULT_TEXTBOX_IMAGE_URLS } from '../constants';
import { padArray, initializeTitleImageCollections, initializeTextboxImageCollections, loadPixelImageCollectionsFromStorage, loadSpriteImageCollectionsFromStorage } from '../utils/boardUtils';
import { storage } from '../utils/storageUtils';

export const useAssets = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [titleImages, setTitleImages] = useState<TitleImageCollections>(() => ({
    'x1/2': padArray([DEFAULT_TITLE_IMAGE_URLS['x1/2']], ASSET_SLOTS),
    x1: padArray([DEFAULT_TITLE_IMAGE_URLS.x1], ASSET_SLOTS),
    x2: padArray([DEFAULT_TITLE_IMAGE_URLS.x2], ASSET_SLOTS),
    x3: padArray([DEFAULT_TITLE_IMAGE_URLS.x3], ASSET_SLOTS),
    x4: padArray([DEFAULT_TITLE_IMAGE_URLS.x4], ASSET_SLOTS),
  }));
  const [textboxImages, setTextboxImages] = useState<TextboxImageCollections>(() => ({
    x1: padArray([DEFAULT_TEXTBOX_IMAGE_URLS.x1], ASSET_SLOTS),
    x4: padArray([DEFAULT_TEXTBOX_IMAGE_URLS.x4], ASSET_SLOTS),
    x16: padArray([DEFAULT_TEXTBOX_IMAGE_URLS.x16], ASSET_SLOTS),
  }));
  const [pixelImages, setPixelImages] = useState<PixelImageCollections>({} as any);
  const [spriteImages, setSpriteImages] = useState<SpriteImageCollections>({} as any);

  const [activeTitleKey, setActiveTitleKey] = useState<TitleCollectionKey>('x1');
  const [activeTextboxKey, setActiveTextboxKey] = useState<TextboxCollectionKey>('x1');
  const [activeCounterKey, setActiveCounterKey] = useState<TitleCollectionKey>('x1');
  const [activeTimerKey, setActiveTimerKey] = useState<TitleCollectionKey>('x1');
  const [activeCheckboxKey, setActiveCheckboxKey] = useState<TitleCollectionKey>('x1');
  const [activePlainTextKey, setActivePlainTextKey] = useState<TitleCollectionKey>('x1');
  const [activePixelKey, setActivePixelKey] = useState<string>('C1');
  const [activeSpriteKey, setActiveSpriteKey] = useState<string>('S1');
  const [pixelSizeMultiplier, setPixelSizeMultiplier] = useState<'x2' | 'x1' | 'x1/2' | 'x1/4'>('x2');
  const [spriteSizeMultiplier, setSpriteSizeMultiplier] = useState<'x2' | 'x1' | 'x1/2' | 'x1/4'>('x2');

  const renamePixelCategory = (id: string, newName: string) => {
    setPixelImages(prev => ({
      ...prev,
      [id]: { ...prev[id], name: newName }
    }));
  };

  const renameSpriteCategory = (id: string, newName: string) => {
    setSpriteImages(prev => ({
      ...prev,
      [id]: { ...prev[id], name: newName }
    }));
  };

  useEffect(() => {
    const initAssets = async () => {
      try {
        const [titles, textboxes, pixels, sprites] = await Promise.all([
          initializeTitleImageCollections(),
          initializeTextboxImageCollections(),
          loadPixelImageCollectionsFromStorage('pixelBoard_pixelImages_collections'),
          loadSpriteImageCollectionsFromStorage('pixelBoard_spriteImages_collections')
        ]);
        setTitleImages(titles);
        setTextboxImages(textboxes);
        setPixelImages(pixels);
        setSpriteImages(sprites);
      } catch (error) {
        console.error("Fatal error during asset initialization:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initAssets();
  }, []);

  useEffect(() => {
    if (!isInitializing) storage.setItem('pixelBoard_titleImages_collections', JSON.stringify(titleImages));
  }, [titleImages, isInitializing]);

  useEffect(() => {
    if (!isInitializing) storage.setItem('pixelBoard_textboxImages_collections', JSON.stringify(textboxImages));
  }, [textboxImages, isInitializing]);

  useEffect(() => {
    if (!isInitializing) storage.setItem('pixelBoard_pixelImages_collections', JSON.stringify(pixelImages));
  }, [pixelImages, isInitializing]);

  useEffect(() => {
    if (!isInitializing) storage.setItem('pixelBoard_spriteImages_collections', JSON.stringify(spriteImages));
  }, [spriteImages, isInitializing]);

  return {
    isInitializing,
    titleImages,
    setTitleImages,
    textboxImages,
    setTextboxImages,
    pixelImages,
    setPixelImages,
    spriteImages,
    setSpriteImages,
    activeTitleKey,
    setActiveTitleKey,
    activeTextboxKey,
    setActiveTextboxKey,
    activeCounterKey,
    setActiveCounterKey,
    activeTimerKey,
    setActiveTimerKey,
    activeCheckboxKey,
    setActiveCheckboxKey,
    activePlainTextKey,
    setActivePlainTextKey,
    activePixelKey,
    setActivePixelKey,
    activeSpriteKey,
    setActiveSpriteKey,
    pixelSizeMultiplier,
    setPixelSizeMultiplier,
    spriteSizeMultiplier,
    setSpriteSizeMultiplier,
    renamePixelCategory,
    renameSpriteCategory
  };
};
