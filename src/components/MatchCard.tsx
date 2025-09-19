import React from 'react';
import type { Match, Team, VolleyballScore, FutsalScore } from '../types';
import { GameStatus, Sport } from '../types';
import { VolleyballIcon, FutsalIcon, WhistleIcon } from './icons';

interface MatchCardProps {
  match: Match;
  teams: Team[];
  isAdmin: boolean;
  onManage: (matchId: number) => void;
}

const TeamDisplay: React.FC<{ team: Team | undefined; score: number; isWinner: boolean }> = ({ team, score, isWinner }) => (
    <div className={`flex justify-between items-center p-3 rounded-md ${isWinner ? 'bg-green-500/20' : 'bg-gray-700/50'}`}>
        <span className={`truncate font-semibold ${isWinner ? 'text-green-300' : ''}`}>{team?.name || 'A definir'}</span>
        <span className={`text-2xl font-bold font-mono ${isWinner ? 'text-green-300' : ''}`}>{score}</span>
    </div>
);

const VolleyballScoreDisplay: React.FC<{ score: VolleyballScore }> = ({ score }) => (
    <div className="flex flex-col items-center justify-center w-16">
        <span className="text-xs text-gray-400">SETS</span>
        <div className="text-2xl font-bold">{score.setsA} - {score.setsB}</div>
    </div>
);

const FutsalScoreDisplay: React.FC<{ score: FutsalScore }> = ({ score }) => {
    if (score.isPenaltyShootout) {
        const penA = score.penalties.a.filter(p => p === true).length;
        const penB = score.penalties.b.filter(p => p === true).length;
        return (
            <div className="flex flex-col items-center justify-center w-16 text-center">
                <span className="text-xs text-gray-400">PÊNALTIS</span>
                <div className="text-xl font-bold">{penA} - {penB}</div>
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center w-16">
            <span className="text-xs text-gray-400">GOLS</span>
            <div className="text-2xl font-bold">{score.goalsA} - {score.goalsB}</div>
        </div>
    );
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, teams, isAdmin, onManage }) => {
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);

  const statusStyles = {
    [GameStatus.Waiting]: { text: 'Aguardando', bg: 'bg-gray-600', text_color: 'text-gray-200' },
    [GameStatus.InProgress]: { text: 'Em Jogo', bg: 'bg-yellow-500 animate-pulse', text_color: 'text-black' },
    [GameStatus.Finished]: { text: 'Finalizado', bg: 'bg-blue-600', text_color: 'text-white' },
  };

  const scoreA = match.sport === Sport.Volleyball ? (match.score as VolleyballScore).setsA : (match.score as FutsalScore).goalsA;
  const scoreB = match.sport === Sport.Volleyball ? (match.score as VolleyballScore).setsB : (match.score as FutsalScore).goalsB;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col">
      <div className="p-3 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {match.sport === Sport.Volleyball ? <VolleyballIcon className="text-orange-400" /> : <FutsalIcon className="text-green-400" />}
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyles[match.status].bg} ${statusStyles[match.status].text_color}`}>
              {statusStyles[match.status].text}
            </span>
          </div>
          {isAdmin && (
            <button onClick={() => onManage(match.id)} className="flex items-center space-x-1 text-sm bg-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-500 transition-colors">
              <WhistleIcon className="w-4 h-4" />
              <span>Gerenciar</span>
            </button>
          )}
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="flex-1 space-y-3">
          <TeamDisplay team={teamA} score={scoreA} isWinner={match.winnerId === teamA?.id} />
          <TeamDisplay team={teamB} score={scoreB} isWinner={match.winnerId === teamB?.id} />
        </div>
        <div className="px-3">
            {match.sport === Sport.Volleyball 
              ? <VolleyballScoreDisplay score={match.score as VolleyballScore} />
              : <FutsalScoreDisplay score={match.score as FutsalScore} />
            }
        </div>
      </div>
    </div>
  );
};