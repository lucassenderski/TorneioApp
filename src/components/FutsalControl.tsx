import React from 'react';
import type { Match, FutsalScore, Team } from '../types';
import { CheckIcon, XIcon } from './icons';

interface FutsalControlProps {
  match: Match;
  teams: Team[];
  onUpdate: (updatedMatch: Match) => void;
  onClose: () => void;
}

const ScoreButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg font-bold transition-transform transform hover:scale-105 ${className}`}>
        {children}
    </button>
);

const FutsalControl: React.FC<FutsalControlProps> = ({ match, teams, onUpdate }) => {
    const score = match.score as FutsalScore;
    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);

    const updateScore = (newScore: FutsalScore) => {
        onUpdate({ ...match, score: newScore });
    };

    const handleGoal = (team: 'A' | 'B', delta: number) => {
        updateScore({
            ...score,
            [`goals${team}`]: Math.max(0, score[`goals${team}`] + delta),
        });
    };
    
    const handleFault = (team: 'A' | 'B', delta: number) => {
        updateScore({
            ...score,
            [`faults${team}`]: Math.max(0, score[`faults${team}`] + delta),
        });
    };

    const togglePenaltyShootout = () => {
        updateScore({ ...score, isPenaltyShootout: !score.isPenaltyShootout });
    };

    const handlePenalty = (team: 'A' | 'B', index: number, result: boolean) => {
        const newPenalties = { ...score.penalties };
        const teamKey = team.toLowerCase() as 'a' | 'b';
        const teamPenalties = [...newPenalties[teamKey]];
        teamPenalties[index] = result;
        newPenalties[teamKey] = teamPenalties;
        updateScore({ ...score, penalties: newPenalties });
    };
    
    const renderPenalties = (team: 'A' | 'B') => {
        const teamKey = team.toLowerCase() as 'a' | 'b';
        const penalties = score.penalties[teamKey];
        const otherTeamKey = teamKey === 'a' ? 'b' : 'a';

        return Array.from({ length: Math.max(3, penalties.length, score.penalties[otherTeamKey].length) }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md">
                <span className="font-bold text-lg">{i + 1}</span>
                {penalties[i] === null ? (
                    <>
                        <button onClick={() => handlePenalty(team, i, true)} className="p-1 bg-green-500 rounded-full hover:bg-green-400"><CheckIcon className="w-5 h-5" /></button>
                        <button onClick={() => handlePenalty(team, i, false)} className="p-1 bg-red-500 rounded-full hover:bg-red-400"><XIcon className="w-5 h-5" /></button>
                    </>
                ) : penalties[i] ? (
                    <CheckIcon className="w-7 h-7 text-green-400" />
                ) : (
                    <XIcon className="w-7 h-7 text-red-400" />
                )}
            </div>
        ));
    };
    
    const addPenaltyRound = () => {
        updateScore({
            ...score,
            penalties: {
                a: [...score.penalties.a, null],
                b: [...score.penalties.b, null],
            }
        });
    };

    if (!teamA || !teamB) return null;

    return (
        <div className="text-white p-4 space-y-4">
            {!score.isPenaltyShootout ? (
                <>
                    {/* Goal Control */}
                    <div className="grid grid-cols-3 items-center text-center gap-4">
                        <h3 className="text-xl font-semibold text-left truncate">{teamA.name}</h3>
                        <div className="text-5xl font-mono flex justify-center items-center space-x-4">
                            <span>{score.goalsA}</span>
                            <span>x</span>
                            <span>{score.goalsB}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-right truncate">{teamB.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                             <ScoreButton onClick={() => handleGoal('A', 1)} className="bg-green-600">Gol +</ScoreButton>
                             <ScoreButton onClick={() => handleGoal('A', -1)} className="bg-red-600">Gol -</ScoreButton>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <ScoreButton onClick={() => handleGoal('B', 1)} className="bg-green-600">Gol +</ScoreButton>
                            <ScoreButton onClick={() => handleGoal('B', -1)} className="bg-red-600">Gol -</ScoreButton>
                        </div>
                    </div>
                    <hr className="border-gray-600" />
                    {/* Fault Control */}
                    <div className="text-center">
                        <h4 className="text-lg font-bold mb-2">Faltas</h4>
                        <div className="grid grid-cols-3 items-center text-center gap-4">
                            <span className="text-2xl font-mono">{score.faultsA}</span>
                            <span>vs</span>
                            <span className="text-2xl font-mono">{score.faultsB}</span>
                        </div>
                         <div className="grid grid-cols-2 gap-4 mt-2">
                             <div className="flex flex-col space-y-2">
                                <ScoreButton onClick={() => handleFault('A', 1)} className="bg-yellow-500 text-black">Falta +</ScoreButton>
                                <ScoreButton onClick={() => handleFault('A', -1)} className="bg-yellow-700">Falta -</ScoreButton>
                             </div>
                             <div className="flex flex-col space-y-2">
                                <ScoreButton onClick={() => handleFault('B', 1)} className="bg-yellow-500 text-black">Falta +</ScoreButton>
                                <ScoreButton onClick={() => handleFault('B', -1)} className="bg-yellow-700">Falta -</ScoreButton>
                             </div>
                         </div>
                    </div>
                     <hr className="border-gray-600" />
                     <button onClick={togglePenaltyShootout} className="w-full py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors font-bold">
                        Ir para Pênaltis
                     </button>
                </>
            ) : (
                <>
                    <h3 className="text-2xl font-bold text-center text-yellow-400">Disputa de Pênaltis</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center space-y-2">
                            <h4 className="font-bold truncate">{teamA.name}</h4>
                            <div className="flex flex-col items-center space-y-2">{renderPenalties('A')}</div>
                        </div>
                         <div className="text-center space-y-2">
                             <h4 className="font-bold truncate">{teamB.name}</h4>
                             <div className="flex flex-col items-center space-y-2">{renderPenalties('B')}</div>
                        </div>
                    </div>
                    <button onClick={addPenaltyRound} className="w-full mt-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors font-semibold">
                        + Adicionar Rodada (Morte Súbita)
                    </button>
                    <button onClick={togglePenaltyShootout} className="w-full mt-2 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors font-bold">
                       Voltar ao Jogo Normal
                    </button>
                </>
            )}
        </div>
    );
};

export default FutsalControl;