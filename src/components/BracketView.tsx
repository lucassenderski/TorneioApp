
import React from 'react';
import type { BracketRound, Team, Match } from '../types';
import { MatchCard } from './MatchCard';

interface BracketViewProps {
  rounds: BracketRound[];
  teams: Team[];
  isAdmin: boolean;
  onManageMatch: (matchId: number) => void;
}

export const BracketView: React.FC<BracketViewProps> = ({ rounds, teams, isAdmin, onManageMatch }) => {
  return (
    <div className="p-4 md:p-8">
      <div className="flex space-x-4 md:space-x-8 overflow-x-auto pb-4">
        {rounds.map(round => (
          <div key={round.id} className="flex-shrink-0 w-80 md:w-96">
            <h2 className="text-2xl font-bold text-center mb-4 text-indigo-400 tracking-wider">{round.name}</h2>
            <div className="space-y-4">
              {round.matches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  teams={teams} 
                  isAdmin={isAdmin}
                  onManage={onManageMatch}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
