
import React, { lazy, Suspense, useState } from 'react';
import type { Match, Team, ActionLog } from '../types';
import { GameStatus, Sport } from '../types';
import { VolleyballIcon, FutsalIcon } from './icons';

const VolleyballControl = lazy(() => import('./VolleyballControl'));
const FutsalControl = lazy(() => import('./FutsalControl'));

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
    </div>
);

interface GameControlModalProps {
  match: Match | null;
  teams: Team[];
  onUpdate: (updatedMatch: Match) => void;
  onClose: () => void;
  actionLogs: ActionLog[];
}

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);


const MatchHistory: React.FC<{ logs: ActionLog[], teams: Team[] }> = ({ logs, teams }) => {
    const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || `ID ${id}`;
    
    const renderLogDetails = (log: ActionLog) => {
        const { action, details } = log;
        switch (action) {
            case 'STATUS_CHANGE':
                return `Status: ${details.from} ➔ ${details.to}`;
            case 'SCORE_UPDATE':
                return `Placar alterado.`; // Simplified for brevity
            default:
                return `Ação desconhecida: ${action}`;
        }
    }

    return (
        <div className="p-4 bg-gray-900 rounded-b-xl">
            <h3 className="font-bold text-lg mb-2 text-indigo-400">Histórico da Partida</h3>
            {logs.length === 0 ? (
                <p className="text-gray-400">Nenhuma alteração registrada para esta partida.</p>
            ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {logs.map(log => (
                        <li key={log.id} className="text-sm p-2 bg-gray-800 rounded-md">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-300">{log.fiscalId}</span>
                                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-gray-400">{renderLogDetails(log)}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
};


export const GameControlModal: React.FC<GameControlModalProps> = ({ match, teams, onUpdate, onClose, actionLogs }) => {
  const [showHistory, setShowHistory] = useState(false);
  if (!match) return null;

  const handleStatusChange = (status: GameStatus) => {
    // Basic winner determination logic
    let winnerId = match.winnerId;
    if (status === GameStatus.Finished) {
      if (match.sport === Sport.Volleyball) {
        const score = match.score as import('../types').VolleyballScore;
        if (score.setsA > score.setsB) winnerId = match.teamAId;
        if (score.setsB > score.setsA) winnerId = match.teamBId;
      } else {
        const score = match.score as import('../types').FutsalScore;
        if (score.goalsA > score.goalsB) winnerId = match.teamAId;
        if (score.goalsB > score.goalsA) winnerId = match.teamBId;
        else { // Check penalties
            const penaltiesA = score.penalties.a.filter(p => p === true).length;
            const penaltiesB = score.penalties.b.filter(p => p === true).length;
            if (penaltiesA > penaltiesB) winnerId = match.teamAId;
            if (penaltiesB > penaltiesA) winnerId = match.teamBId;
        }
      }
    } else {
        winnerId = null;
    }
    
    onUpdate({ ...match, status, winnerId });
    if(status === GameStatus.Finished) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {match.sport === Sport.Volleyball ? <VolleyballIcon className="w-7 h-7 text-orange-400"/> : <FutsalIcon className="w-7 h-7 text-green-400"/>}
            <h2 className="text-lg font-bold">Gerenciar Jogo</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowHistory(!showHistory)} className="text-gray-400 hover:text-indigo-400" title="Ver Histórico da Partida">
                <HistoryIcon className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
        </header>
        
        {showHistory && <MatchHistory logs={actionLogs} teams={teams} />}

        <div className="overflow-y-auto p-2">
            <Suspense fallback={<LoadingSpinner />}>
                {match.sport === Sport.Volleyball ? (
                    <VolleyballControl match={match} teams={teams} onUpdate={onUpdate} onClose={onClose} />
                ) : (
                    <FutsalControl match={match} teams={teams} onUpdate={onUpdate} onClose={onClose} />
                )}
            </Suspense>
        </div>
        
        <footer className="p-4 border-t border-gray-700 mt-auto">
            <h3 className="text-sm font-semibold mb-2 text-center text-gray-400">Status da Partida</h3>
            <div className="flex justify-around items-center">
                <button onClick={() => handleStatusChange(GameStatus.InProgress)} className={`px-4 py-2 rounded-lg font-semibold ${match.status === GameStatus.InProgress ? 'bg-yellow-500 text-black' : 'bg-gray-600'}`}>Em Jogo</button>
                <button onClick={() => handleStatusChange(GameStatus.Finished)} className={`px-4 py-2 rounded-lg font-semibold ${match.status === GameStatus.Finished ? 'bg-green-500' : 'bg-gray-600'}`}>Finalizar</button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-red-600 font-semibold">Fechar Painel</button>
            </div>
        </footer>
      </div>
    </div>
  );
};
