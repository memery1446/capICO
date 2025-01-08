import React, { useEffect, useRef } from 'react';

const GlobalError = ({ error, onClose }) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (error) {
      closeButtonRef.current?.focus();

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [error, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error.message) return error.message;
    return String(error);
  };

  if (!error) return null;

  return (
    <div 
      ref={dialogRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-labelledby="error-title"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h2 id="error-title" className="text-xl font-bold mb-4">Error</h2>
        <p className="mb-4">{getErrorMessage(error)}</p>
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Close error message"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GlobalError;
