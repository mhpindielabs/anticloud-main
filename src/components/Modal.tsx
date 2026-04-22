import React from 'react';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, title, children, className = "max-w-2xl" }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`pixel-panel w-full ${className} text-white relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl mb-4 text-center neon-text" style={{ textShadow: '2px 2px var(--pixel-border-color)' }}>{title}</h2>
        {children}
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 pixel-button w-10 h-10 flex items-center justify-center text-2xl bg-red-700 hover:bg-red-600 -m-1"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default Modal;