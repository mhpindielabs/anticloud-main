import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';
import { TextboxImageCollections, TextboxCollectionKey } from '../types';

interface AddSuperTitleModalProps {
  collections: TextboxImageCollections;
  onAdd: (imageUrl1: string, imageUrl2: string, interval: number) => void;
  onClose: () => void;
}

const AddSuperTitleModal: React.FC<AddSuperTitleModalProps> = ({ collections, onAdd, onClose }) => {
  // Ya no usamos 'size' (Paso 1), empezamos directamente en 'img1'
  const [step, setStep] = useState<'img1' | 'img2' | 'interval'>('img1');
  const [selectedCollection, setSelectedCollection] = useState<TextboxCollectionKey>('x1');
  const [img1, setImg1] = useState<string>('');
  const [img2, setImg2] = useState<string>('');
  const [interval, setInterval] = useState<number>(500);
  const [bpm, setBpm] = useState<number>(120);
  const [currentIndex, setCurrentIndex] = useState(0);

  const availableImages = collections[selectedCollection].filter((img): img is string => !!img);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCollection, step]);

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);
    setBpm(Math.round(60000 / newInterval));
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    if (newBpm > 0) {
      setInterval(Math.round(60000 / newBpm));
    }
  };

  const handleNextStep = () => {
    if (step === 'img1') {
      if (availableImages.length > 0) {
        setImg1(availableImages[currentIndex]);
        setStep('img2');
      }
    } else if (step === 'img2') {
      if (availableImages.length > 0) {
        setImg2(availableImages[currentIndex]);
        setStep('interval');
      }
    } else {
      onAdd(img1, img2, interval);
    }
  };

  const handlePrevStep = () => {
    if (step === 'img2') setStep('img1');
    else if (step === 'interval') setStep('img2');
  };

  const handlePrevImg = () => {
    setCurrentIndex((prev) => (prev === 0 ? availableImages.length - 1 : prev - 1));
  };

  const handleNextImg = () => {
    setCurrentIndex((prev) => (prev === availableImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Modal onClose={onClose} title="Añadir SuperTitle (9-Slice)" className="max-w-2xl">
      <div className="p-6 flex flex-col gap-6">
        
        {/* Selector de Colección (Opcional, pero útil para variar el estilo de la caja) */}
        {(step === 'img1' || step === 'img2') && (
          <div className="flex justify-center gap-2 mb-2">
            {(['x1', 'x4', 'x16'] as TextboxCollectionKey[]).map(key => (
              <button
                key={key}
                onClick={() => setSelectedCollection(key)}
                className={`pixel-button px-4 py-1 text-sm ${selectedCollection === key ? 'pixel-button-active' : ''}`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {(step === 'img1' || step === 'img2') && (
          <div className="flex flex-col gap-4 items-center">
            <h3 className="text-xl uppercase text-center">
              Paso {step === 'img1' ? '1' : '2'}: Elige la {step === 'img1' ? 'primera' : 'segunda'} "piel" de la caja
            </h3>
            <div className="w-full h-48 pixel-content-box flex items-center justify-center bg-[#203c56]">
              {availableImages.length > 0 ? (
                <div 
                  className="w-48 h-24"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: '18px 31px 24px 28px',
                    borderImage: `url("${availableImages[currentIndex]}") 18 31 24 28 fill stretch`,
                    imageRendering: 'pixelated'
                  }}
                />
              ) : (
                <p>No hay imágenes en esta colección</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handlePrevImg} className="pixel-button p-2" disabled={availableImages.length <= 1}>
                <ArrowLeftIcon />
              </button>
              <span className="text-xl min-w-[60px] text-center">{availableImages.length > 0 ? currentIndex + 1 : 0} / {availableImages.length}</span>
              <button onClick={handleNextImg} className="pixel-button p-2" disabled={availableImages.length <= 1}>
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}

        {step === 'interval' && (
          <div className="flex flex-col gap-6 items-center">
            <h3 className="text-xl uppercase text-center">Paso 3: Velocidad de parpadeo</h3>
            
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm uppercase opacity-70">Milisegundos (ms)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="10"
                    value={interval}
                    onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xl font-mono w-24 text-right">{interval}ms</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm uppercase opacity-70">Beats Per Minute (BPM)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="30"
                    max="1200"
                    value={bpm}
                    onChange={(e) => handleBpmChange(parseInt(e.target.value) || 0)}
                    className="pixel-input text-xl w-32"
                  />
                  <span className="text-sm opacity-50">Cambia cada {interval}ms</span>
                </div>
              </div>
            </div>

            <div className="flex gap-8 mt-4">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase opacity-50">Caja 1</span>
                    <div className="w-24 h-12" style={{
                      borderStyle: 'solid',
                      borderWidth: '10px 15px 12px 14px',
                      borderImage: `url("${img1}") 10 15 12 14 fill stretch`,
                      imageRendering: 'pixelated'
                    }} />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase opacity-50">Caja 2</span>
                    <div className="w-24 h-12" style={{
                      borderStyle: 'solid',
                      borderWidth: '10px 15px 12px 14px',
                      borderImage: `url("${img2}") 10 15 12 14 fill stretch`,
                      imageRendering: 'pixelated'
                    }} />
                </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
          <button onClick={step === 'img1' ? onClose : handlePrevStep} className="pixel-button px-6 py-2 bg-red-700">
            {step === 'img1' ? 'Cancelar' : 'Atrás'}
          </button>
          <button 
            onClick={handleNextStep} 
            className="pixel-button px-6 py-2 bg-green-700"
            disabled={(step === 'img1' || step === 'img2') && availableImages.length === 0}
          >
            {step === 'interval' ? 'Añadir SuperTitle' : 'Siguiente'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSuperTitleModal;
