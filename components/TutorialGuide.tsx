import React, { useState, useEffect, useLayoutEffect } from 'react';

interface TutorialStep {
  elementId?: string;
  title: string;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '¡Bienvenido a Pixel Board!',
    text: 'Esta es una guía rápida para mostrarte las funciones principales. ¡Vamos a empezar!',
    position: 'bottom',
  },
  {
    elementId: 'tutorial-add-title',
    title: 'Añadir Títulos',
    text: 'Haz clic aquí para añadir un elemento de título pre-diseñado a tu pizarra.',
    position: 'right',
  },
  {
    elementId: 'tutorial-add-textbox',
    title: 'Añadir Cajas de Texto',
    text: 'Usa esto para añadir cajas de texto con diferentes estilos y tamaños.',
    position: 'right',
  },
  {
    elementId: 'tutorial-add-pixel',
    title: 'Añadir Ilustraciones',
    text: 'Añade ilustraciones y arte pixelado desde tus colecciones.',
    position: 'right',
  },
  {
    elementId: 'tutorial-add-sprite',
    title: 'Añadir Sprites',
    text: 'Perfecto para añadir personajes u objetos pequeños a tu escena.',
    position: 'right',
  },
  {
    elementId: 'tutorial-ai-generate',
    title: 'Generación con IA',
    text: '¡Crea sprites únicos usando IA! Simplemente escribe una descripción y deja que la magia suceda.',
    position: 'right',
  },
    {
    elementId: 'tutorial-music',
    title: 'Herramientas Musicales',
    text: '¡Nueva sección! Aquí encontrarás herramientas para músicos: acordes, escalas y grados.',
    position: 'right',
  },
  {
    elementId: 'tutorial-add-chord',
    title: 'Añadir Acordes',
    text: 'Inserta acordes individuales rápidamente. Puedes elegir la raíz, el sufijo y el color.',
    position: 'right',
  },
  {
    elementId: 'tutorial-add-harmonization',
    title: 'Armonización y Escalas',
    text: 'Inserta automáticamente los 7 acordes de una escala, las notas o los grados en números romanos.',
    position: 'right',
  },
  {
    elementId: 'tutorial-viewport',
    title: 'Transposición Inteligente',
    text: 'Los elementos musicales tienen funciones especiales: ¡usa los botones de subir/bajar del menú flotante para transponer la tonalidad!',
    position: 'bottom',
  },
  {
    elementId: 'tutorial-change-background',
    title: 'Cambiar Fondo',
    text: 'Sube tu propia imagen para usarla como fondo de la pizarra.',
    position: 'right',
  },
  {
    elementId: 'tutorial-toggle-grid',
    title: 'Activar Cuadrícula',
    text: 'Muestra una cuadrícula y activa el ajuste a la misma para alinear elementos fácilmente.',
    position: 'right',
  },
    {
    elementId: 'tutorial-capture',
    title: 'Capturar y Exportar',
    text: 'Cuando tu creación esté lista, usa este botón para guardar una imagen de tu pizarra.',
    position: 'right',
  },
  {
    elementId: 'tutorial-theme-change',
    title: 'Cambiar Temas',
    text: 'Personaliza el aspecto de la aplicación. ¡Prueba los diferentes temas visuales!',
    position: 'right',
  },
  {
    elementId: 'tutorial-show-help',
    title: 'Ayuda',
    text: 'Puedes volver a ver este tutorial en cualquier momento haciendo clic aquí.',
    position: 'right',
  },
  {
    elementId: 'tutorial-viewport',
    title: 'Tu Espacio de Trabajo',
    text: 'Esta es tu pizarra. Puedes arrastrarla para moverte y usar la rueda del ratón para hacer zoom.',
    position: 'bottom',
  },
  {
    elementId: 'tutorial-board-nav',
    title: 'Navegación de Pizarras',
    text: 'Puedes tener múltiples pizarras. Usa estos botones para moverte entre ellas o para crear una nueva.',
    position: 'top',
  },
  {
    title: '¡Todo listo!',
    text: 'Ya conoces lo básico. ¡Es hora de desatar tu creatividad!',
    position: 'bottom',
  }
];

interface TutorialGuideProps {
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({ step, onNext, onPrev, onSkip }) => {
  const [highlighterStyle, setHighlighterStyle] = useState<React.CSSProperties>({});
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const currentStep = TUTORIAL_STEPS[step];

  useLayoutEffect(() => {
    if (!currentStep) return;

    const isCenteredStep = !currentStep.elementId || currentStep.elementId === 'tutorial-viewport';
    const targetElement = isCenteredStep ? null : document.getElementById(currentStep.elementId);

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const PADDING = 8;
      
      setHighlighterStyle({
        top: `${rect.top - PADDING}px`,
        left: `${rect.left - PADDING}px`,
        width: `${rect.width + PADDING * 2}px`,
        height: `${rect.height + PADDING * 2}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        borderRadius: '4px',
        position: 'fixed',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1000,
        pointerEvents: 'none',
      });

      const popoverPos: React.CSSProperties = { position: 'fixed', zIndex: 1001 };
      let position = currentStep.position || 'bottom';
      
      const POPOVER_WIDTH = 384; // w-96
      const POPOVER_ESTIMATED_HEIGHT = 180;
      const SCREEN_PADDING = 16;
      const { innerWidth, innerHeight } = window;

      // Automatically adjust position to fit on screen
      switch (position) {
          case 'top':
              if (rect.top - POPOVER_ESTIMATED_HEIGHT < SCREEN_PADDING) position = 'bottom';
              break;
          case 'bottom':
              if (rect.bottom + POPOVER_ESTIMATED_HEIGHT > innerHeight - SCREEN_PADDING) position = 'top';
              break;
          case 'right':
              if (rect.right + POPOVER_WIDTH > innerWidth - SCREEN_PADDING) position = 'left';
              break;
          case 'left':
              if (rect.left - POPOVER_WIDTH < SCREEN_PADDING) position = 'right';
              break;
      }
      
      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

      if (position === 'bottom') {
        popoverPos.top = `${rect.bottom + PADDING + 5}px`;
        popoverPos.left = `${clamp(rect.left + rect.width / 2, SCREEN_PADDING + POPOVER_WIDTH / 2, innerWidth - SCREEN_PADDING - POPOVER_WIDTH / 2)}px`;
        popoverPos.transform = 'translateX(-50%)';
      } else if (position === 'top') {
        popoverPos.top = `${rect.top - PADDING - 5}px`;
        popoverPos.left = `${clamp(rect.left + rect.width / 2, SCREEN_PADDING + POPOVER_WIDTH / 2, innerWidth - SCREEN_PADDING - POPOVER_WIDTH / 2)}px`;
        popoverPos.transform = 'translate(-50%, -100%)';
      } else if (position === 'right') {
        popoverPos.top = `${clamp(rect.top, SCREEN_PADDING, innerHeight - SCREEN_PADDING - POPOVER_ESTIMATED_HEIGHT)}px`;
        popoverPos.left = `${rect.right + PADDING + 5}px`;
      } else if (position === 'left') {
        popoverPos.top = `${clamp(rect.top, SCREEN_PADDING, innerHeight - SCREEN_PADDING - POPOVER_ESTIMATED_HEIGHT)}px`;
        popoverPos.left = `${rect.left - PADDING - 5}px`;
        popoverPos.transform = 'translateX(-100%)';
      }
      setPopoverStyle(popoverPos);

    } else {
        setHighlighterStyle({
           position: 'fixed',
           inset: 0,
           boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
           zIndex: 1000,
        });
        setPopoverStyle({
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
        });
    }

  }, [step, currentStep]);

  if (!currentStep) return null;

  return (
    <>
      <div style={highlighterStyle} />
      <div style={popoverStyle} className="tutorial-popover pixel-panel w-96 max-w-sm">
        <div className="flex flex-col gap-3">
            <h3 className="text-2xl neon-text" style={{ textShadow: '2px 2px var(--pixel-border-color)' }}>{currentStep.title}</h3>
            <p className="text-lg">{currentStep.text}</p>
            <div className="flex justify-between items-center mt-2">
                <button onClick={onSkip} className="pixel-button px-3 py-1 text-lg bg-red-700 hover:bg-red-600">Saltar</button>
                <div className="flex items-center gap-2">
                    {step > 0 && <button onClick={onPrev} className="pixel-button px-3 py-1 text-lg">Anterior</button>}
                    <button onClick={onNext} className="pixel-button px-3 py-1 text-lg bg-green-700 hover:bg-green-600">
                        {step === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </button>
                    <span className="text-lg ml-2">{step + 1} / {TUTORIAL_STEPS.length}</span>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default TutorialGuide;