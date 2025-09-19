
import React, { useState } from 'react';
import { LockClosedIcon } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (fiscalId: string, password: string) => void;
  error: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, error }) => {
  const [fiscalId, setFiscalId] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = () => {
    if (!fiscalId.trim()) {
      alert('Por favor, insira seu nome de fiscal ou e-mail.');
      return;
    }
    onLogin(fiscalId, password);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  const handleClose = () => {
    setFiscalId('');
    setPassword('');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm border border-gray-700">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <LockClosedIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-lg font-bold">Acesso Fiscal</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </header>
        <div className="p-6 space-y-4">
           {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</div>}
           <div>
            <label htmlFor="fiscal-id-input" className="block text-sm font-medium text-gray-300 mb-1">
              Nome do Fiscal ou E-mail
            </label>
            <input
              id="fiscal-id-input"
              type="text"
              value={fiscalId}
              onChange={(e) => setFiscalId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: João Silva ou joao@email.com"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="password-input" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <footer className="p-4 border-t border-gray-700 flex justify-end space-x-3">
            <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Cancelar</button>
            <button onClick={handleLogin} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors">Entrar</button>
        </footer>
      </div>
    </div>
  );
};
