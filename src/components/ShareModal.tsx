
import React, { useState } from 'react';
import type { Sport } from '../types';
import { CheckIcon } from './icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: Sport;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, sport }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?view=${sport}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Compartilhar Torneio (Modo Público)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </header>
        <div className="p-6 space-y-4">
            <p className="text-gray-300">
                Qualquer pessoa com este link poderá visualizar o andamento do torneio em tempo real, mas não poderá fazer alterações.
            </p>
            <div className="flex space-x-2">
                 <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-cyan-300 selection:bg-cyan-800"
                />
                <button 
                    onClick={handleCopy} 
                    className={`w-32 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center ${copied ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                >
                    {copied ? <><CheckIcon className="w-5 h-5 mr-2"/> Copiado!</> : 'Copiar Link'}
                </button>
            </div>
        </div>
        <footer className="p-4 border-t border-gray-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Fechar</button>
        </footer>
      </div>
    </div>
  );
};
