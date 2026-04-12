import React from 'react';
import { DpadUpIcon, DpadDownIcon, DpadLeftIcon, DpadRightIcon } from './Icons';

type Direction = 'up' | 'down' | 'left' | 'right';

interface DpadProps {
  onMoveStart: (direction: Direction) => void;
  onMoveEnd: () => void;
}

const Dpad: React.FC<DpadProps> = ({ onMoveStart, onMoveEnd }) => {
  const handleMouseDown = (direction: Direction) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onMoveStart(direction);
  };
  
  const handleTouchStart = (direction: Direction) => (e: React.TouchEvent) => {
    e.stopPropagation();
    onMoveStart(direction);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onMoveEnd();
  };

  return (
    <div className="fixed bottom-4 right-4 z-20 grid grid-cols-3 grid-rows-3 w-40 h-40">
      <div className="col-start-2 row-start-1 flex justify-center items-center">
        <button
          className="pixel-button p-2 w-full h-full flex justify-center items-center"
          onMouseDown={handleMouseDown('up')}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart('up')}
          onTouchEnd={handleEnd}
          aria-label="Move up"
        >
          <DpadUpIcon />
        </button>
      </div>
      <div className="col-start-1 row-start-2 flex justify-center items-center">
        <button
          className="pixel-button p-2 w-full h-full flex justify-center items-center"
          onMouseDown={handleMouseDown('left')}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart('left')}
          onTouchEnd={handleEnd}
          aria-label="Move left"
        >
          <DpadLeftIcon />
        </button>
      </div>
      <div className="col-start-3 row-start-2 flex justify-center items-center">
        <button
          className="pixel-button p-2 w-full h-full flex justify-center items-center"
          onMouseDown={handleMouseDown('right')}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart('right')}
          onTouchEnd={handleEnd}
          aria-label="Move right"
        >
          <DpadRightIcon />
        </button>
      </div>
      <div className="col-start-2 row-start-3 flex justify-center items-center">
        <button
          className="pixel-button p-2 w-full h-full flex justify-center items-center"
          onMouseDown={handleMouseDown('down')}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleTouchStart('down')}
          onTouchEnd={handleEnd}
          aria-label="Move down"
        >
          <DpadDownIcon />
        </button>
      </div>
    </div>
  );
};

export default Dpad;
