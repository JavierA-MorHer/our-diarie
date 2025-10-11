import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2 } from 'react-feather';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  isDeleting = false 
}: DeleteConfirmationModalProps) {
  console.log('DeleteConfirmationModal render:', { isOpen, title, itemName });
  
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" 
      style={{ 
        zIndex: 99999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full border-4 border-red-500 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#B9AE9D]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="family-lora text-xl text-[#4E443A]">{title}</h2>
              <p className="text-sm text-[#9A9B73] family-inter">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9A9B73] hover:text-[#D97746] transition-colors"
            disabled={isDeleting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#4E443A] family-inter mb-4">
            {message}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 family-inter font-medium text-sm mb-1">
                  ¿Estás seguro?
                </p>
                <p className="text-red-700 family-inter text-sm">
                  Se eliminará permanentemente: <strong>{itemName}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 border border-[#B9AE9D] text-[#9A9B73] rounded-lg hover:bg-[#B9AE9D]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors family-inter"
            >
              Cancelar
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors family-inter flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}