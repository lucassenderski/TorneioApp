
import React from 'react';
import type { ActionLog, FiscalSession, Team, Sport } from '../types';
import { FutsalIcon, VolleyballIcon } from './icons';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActionLog[];
  sessions: FiscalSession[];
  teams: Team[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, logs, sessions, teams }) => {
  if (!isOpen) return null;

  const getTeamName = (id: number | null) => {
      if (id === null) return 'N/A';
      return teams.find(t => t.id === id)?.name || `ID ${id}`;
  };

  const renderLogDetails = (log: ActionLog) => {
    const { action, details, sport } = log;
    
    switch (action) {
      case 'STATUS_CHANGE':
        return `mudou o status de "${details.from}" para "${details.to}".`;
      case 'SCORE_UPDATE':
        if (sport === 'futsal') {
            return `atualizou o placar de Futsal.`;
        } else {
            return `atualizou o placar de Vôlei.`;
        }
      default:
        return `realizou uma ação desconhecida: ${action}`;
    }
  };

  const combinedHistory = [
    ...logs.map(log => ({ ...log, type: 'action' })),
    ...sessions.map(session => ({ ...session, type: 'session_login', timestamp: session.loginTime })),
    ...sessions.filter(s => s.logoutTime).map(session => ({ ...session, type: 'session_logout', timestamp: session.logoutTime! }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Histórico de Atividades</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </header>

        <div className="overflow-y-auto p-4 space-y-3">
          {combinedHistory.length > 0 ? combinedHistory.map((item: any) => (
            <div key={item.id} className="bg-gray-700/50 p-3 rounded-md text-sm">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-indigo-400">{item.fiscalId}</span>
                    <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                    {item.type === 'action' && (item.sport === 'volleyball' ? <VolleyballIcon className="w-4 h-4 text-orange-400" /> : <FutsalIcon className="w-4 h-4 text-green-400" />)}
                    <p>
                        {item.type === 'session_login' && 'fez login no sistema.'}
                        {item.type === 'session_logout' && 'fez logout do sistema.'}
                        {item.type === 'action' && `Na partida #${item.matchId}, ${renderLogDetails(item)}`}
                    </p>
                </div>
            </div>
          )) : <p className="text-gray-400 text-center">Nenhuma atividade registrada.</p>}
        </div>

        <footer className="p-4 border-t border-gray-700 mt-auto flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Fechar</button>
        </footer>
      </div>
    </div>
  );
};
