import React from 'react';
import type { Match, VolleyballScore, Team } from '../types';

interface VolleyballControlProps {
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

const VolleyballControl: React.FC<VolleyballControlProps> = ({ match, teams, onUpdate }) => {
    const score = match.score as VolleyballScore;
    const teamA = teams.find(t => t.id === match.teamAId);
    const teamB = teams.find(t => t.id === match.teamBId);

    const updateScore = (newScore: VolleyballScore) => {
        onUpdate({ ...match, score: newScore });
    };

    const handlePoint = (team: 'a' | 'b', delta: number) => {
        const newPoints = [...score.points];
        const currentSetIndex = score.currentSet - 1;

        const updatedSetPoints = {
            ...newPoints[currentSetIndex],
            [team]: Math.max(0, (newPoints[currentSetIndex]?.[team] || 0) + delta)
        };
        newPoints[currentSetIndex] = updatedSetPoints;
        
        updateScore({ ...score, points: newPoints });
    };
    
    const handleSet = (team: 'A' | 'B', delta: number) => {
        updateScore({
            ...score,
            [`sets${team}`]: Math.max(0, score[`sets${team}`] + delta),
        });
    };
    
    const changeSet = (direction: 'next' | 'prev') => {
        const nextSet = direction === 'next' ? score.currentSet + 1 : score.currentSet - 1;
        if (nextSet < 1 || nextSet > 5) return;

        const newPoints = [...score.points];
        if (!newPoints[nextSet - 1]) {
             newPoints[nextSet - 1] = { a: 0, b: 0 };
        }
        updateScore({ ...score, currentSet: nextSet, points: newPoints });
    }

    if (!teamA || !teamB) return null;
    const currentSetIndex = score.currentSet - 1;
    const currentPoints = score.points[currentSetIndex] || { a: 0, b: 0 };

    return (
        <div className="text-white p-4 space-y-4">
            {/* Team and Set Score */}
            <div className="grid grid-cols-3 items-center text-center gap-4">
                <h3 className="text-xl font-semibold text-left truncate">{teamA.name}</h3>
                <div className="text-2xl font-bold bg-orange-600 py-1 rounded-md">
                    SETS: {score.setsA} x {score.setsB}
                </div>
                <h3 className="text-xl font-semibold text-right truncate">{teamB.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex space-x-2">
                    <ScoreButton onClick={() => handleSet('A', 1)} className="bg-orange-500 w-full">Set +</ScoreButton>
                    <ScoreButton onClick={() => handleSet('A', -1)} className="bg-orange-700 w-full">Set -</ScoreButton>
                </div>
                 <div className="flex space-x-2">
                    <ScoreButton onClick={() => handleSet('B', 1)} className="bg-orange-500 w-full">Set +</ScoreButton>
                    <ScoreButton onClick={() => handleSet('B', -1)} className="bg-orange-700 w-full">Set -</ScoreButton>
                </div>
            </div>
            <hr className="border-gray-600"/>

            {/* Current Set Points */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-4">
                    <button onClick={() => changeSet('prev')} className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50" disabled={score.currentSet <= 1}>&lt;</button>
                    <h4 className="text-lg font-bold">Set Atual: {score.currentSet}</h4>
                    <button onClick={() => changeSet('next')} className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50" disabled={score.currentSet >= 5}>&gt;</button>
                </div>
                <div className="text-6xl font-mono flex justify-center items-center space-x-6">
                    <span>{currentPoints.a}</span>
                    <span className="text-4xl">x</span>
                    <span>{currentPoints.b}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                    <ScoreButton onClick={() => handlePoint('a', 1)} className="bg-green-600">Ponto +</ScoreButton>
                    <ScoreButton onClick={() => handlePoint('a', -1)} className="bg-red-600">Ponto -</ScoreButton>
                </div>
                <div className="flex flex-col space-y-2">
                    <ScoreButton onClick={() => handlePoint('b', 1)} className="bg-green-600">Ponto +</ScoreButton>
                    <ScoreButton onClick={() => handlePoint('b', -1)} className="bg-red-600">Ponto -</ScoreButton>
                </div>
            </div>
        </div>
    );
};

export default VolleyballControl;