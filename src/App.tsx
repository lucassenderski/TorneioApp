
import React, { useState, useMemo, useEffect } from 'react';
import type { Team, BracketRound, Match, VolleyballScore, FutsalScore, ActionLog, FiscalSession } from './types';
import { GameStatus, Sport } from './types';
import { BracketView } from './components/BracketView';
import { GameControlModal } from './components/GameControlModal';
import { TeamManagementModal } from './components/TeamManagementModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { HistoryModal } from './components/HistoryModal';
import { ShareModal } from './components/ShareModal'; // New Import
import { LockClosedIcon, FutsalIcon, VolleyballIcon } from './components/icons';

interface TournamentData {
  teams: Team[];
  rounds: BracketRound[];
}

const createFutsalScore = (): FutsalScore => ({
  goalsA: 0, goalsB: 0, faultsA: 0, faultsB: 0, isPenaltyShootout: false, penalties: { a: Array(3).fill(null), b: Array(3).fill(null) }
});

const createVolleyballScore = (): VolleyballScore => ({
  setsA: 0, setsB: 0, currentSet: 1, points: [{ a: 0, b: 0 }], faultsA: 0, faultsB: 0
});

const createInitialData = (): { [key in Sport]: TournamentData } => {
  // Futsal Data (16 Teams, 4 Rounds)
  const futsalTeams = Array.from({ length: 16 }, (_, i) => ({ id: i + 1, name: `Time Futsal ${i + 1}` }));
  const futsalRounds: BracketRound[] = [
    {
      id: 1, name: 'Oitavas de Final',
      matches: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1, sport: Sport.Futsal, teamAId: i * 2 + 1, teamBId: i * 2 + 2, status: GameStatus.Waiting, score: createFutsalScore()
      }))
    },
    {
      id: 2, name: 'Quartas de Final',
      matches: Array.from({ length: 4 }, (_, i) => ({
        id: 9 + i, sport: Sport.Futsal, teamAId: null, teamBId: null, status: GameStatus.Waiting, score: createFutsalScore()
      }))
    },
    {
      id: 3, name: 'Semifinal',
      matches: Array.from({ length: 2 }, (_, i) => ({
        id: 13 + i, sport: Sport.Futsal, teamAId: null, teamBId: null, status: GameStatus.Waiting, score: createFutsalScore()
      }))
    },
    {
      id: 4, name: 'Final',
      matches: [{ id: 15, sport: Sport.Futsal, teamAId: null, teamBId: null, status: GameStatus.Waiting, score: createFutsalScore() }]
    }
  ];

  // Volleyball Data (8 Teams, 3 Rounds)
  const volleyballTeams = Array.from({ length: 8 }, (_, i) => ({ id: 101 + i, name: `Time Vôlei ${i + 1}` }));
  const volleyballRounds: BracketRound[] = [
    {
      id: 101, name: 'Quartas de Final',
      matches: Array.from({ length: 4 }, (_, i) => ({
        id: 101 + i, sport: Sport.Volleyball, teamAId: 101 + i * 2, teamBId: 102 + i * 2, status: GameStatus.Waiting, score: createVolleyballScore()
      }))
    },
    {
      id: 102, name: 'Semifinal',
      matches: Array.from({ length: 2 }, (_, i) => ({
        id: 105 + i, sport: Sport.Volleyball, teamAId: null, teamBId: null, status: GameStatus.Waiting, score: createVolleyballScore()
      }))
    },
    {
      id: 103, name: 'Final',
      matches: [{ id: 107, sport: Sport.Volleyball, teamAId: null, teamBId: null, status: GameStatus.Waiting, score: createVolleyballScore() }]
    }
  ];

  return {
    [Sport.Futsal]: { teams: futsalTeams, rounds: futsalRounds },
    [Sport.Volleyball]: { teams: volleyballTeams, rounds: volleyballRounds }
  };
};

const App: React.FC = () => {
  const [tournaments, setTournaments] = useState<{ [key in Sport]: TournamentData }>(() => {
    try {
      const savedData = localStorage.getItem('tournamentData');
      return savedData ? JSON.parse(savedData) : createInitialData();
    } catch (error) {
      console.error("Failed to parse tournament data from localStorage", error);
      return createInitialData();
    }
  });

  const [actionLogs, setActionLogs] = useState<ActionLog[]>(() => {
    try {
      const savedLogs = localStorage.getItem('actionLogs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch {
      return [];
    }
  });

  const [fiscalSessions, setFiscalSessions] = useState<FiscalSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem('fiscalSessions');
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch {
      return [];
    }
  });

  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.Futsal);
  const [currentFiscal, setCurrentFiscal] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // New state for share modal
  const [managingMatchId, setManagingMatchId] = useState<number | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isPublicView, setIsPublicView] = useState(false); // New state for public view

  useEffect(() => {
    // Check for public view mode on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const viewSport = urlParams.get('view');
    if (viewSport === Sport.Futsal || viewSport === Sport.Volleyball) {
      setIsPublicView(true);
      setSelectedSport(viewSport);
      // In a real-time app, you'd fetch data from a server here.
      // For now, it will show the data from the official's localStorage if on the same browser,
      // or initial data if not.
    }
  }, []);
  
  const currentTournament = tournaments[selectedSport];

  // Data persistence effect - only runs when not in public view
  useEffect(() => {
    if (!isPublicView) {
      localStorage.setItem('tournamentData', JSON.stringify(tournaments));
    }
  }, [tournaments, isPublicView]);

  useEffect(() => {
    if (!isPublicView) {
      localStorage.setItem('actionLogs', JSON.stringify(actionLogs));
    }
  }, [actionLogs, isPublicView]);

  useEffect(() => {
    if (!isPublicView) {
      localStorage.setItem('fiscalSessions', JSON.stringify(fiscalSessions));
    }
  }, [fiscalSessions, isPublicView]);

  useEffect(() => {
    if (!localStorage.getItem('adminPassword')) {
      localStorage.setItem('adminPassword', 'admin123');
    }
  }, []);
  
  const addLog = (log: Omit<ActionLog, 'id' | 'timestamp' | 'fiscalId'>) => {
    if (!currentFiscal) return;
    const newLog: ActionLog = {
      ...log,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      fiscalId: currentFiscal,
    };
    setActionLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (fiscalId: string, password: string) => {
    const storedPassword = localStorage.getItem('adminPassword');
    if (password === storedPassword) {
      const sessionId = `${Date.now()}-${fiscalId}`;
      const newSession: FiscalSession = { id: sessionId, fiscalId, loginTime: new Date().toISOString() };
      setFiscalSessions(prev => [newSession, ...prev]);
      setCurrentFiscal(fiscalId);
      setCurrentSessionId(sessionId);
      setIsLoginModalOpen(false);
      setLoginError(null);
    } else {
      setLoginError('Nome de usuário ou senha incorreta.');
    }
  };

  const handleLogout = () => {
    if (currentSessionId) {
      setFiscalSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, logoutTime: new Date().toISOString() } : s));
    }
    setCurrentFiscal(null);
    setCurrentSessionId(null);
  };
  
  const handleChangePassword = (newPassword: string) => {
    localStorage.setItem('adminPassword', newPassword);
    setIsChangePasswordModalOpen(false);
    alert('Senha alterada com sucesso!');
  };

  const handleUpdateMatch = (updatedMatch: Match) => {
    const originalMatch = managingMatch;
    if (!originalMatch) return;

    if (JSON.stringify(originalMatch.score) !== JSON.stringify(updatedMatch.score)) {
      addLog({ matchId: updatedMatch.id, sport: updatedMatch.sport, action: 'SCORE_UPDATE', details: { from: originalMatch.score, to: updatedMatch.score } });
    }
    if (originalMatch.status !== updatedMatch.status) {
       addLog({ matchId: updatedMatch.id, sport: updatedMatch.sport, action: 'STATUS_CHANGE', details: { from: originalMatch.status, to: updatedMatch.status } });
    }

    setTournaments(prev => {
        const sportData = prev[selectedSport];
        let newRounds = sportData.rounds.map(round => ({
            ...round,
            matches: round.matches.map(match => match.id === updatedMatch.id ? updatedMatch : match),
        }));

        if (updatedMatch.status === GameStatus.Finished && updatedMatch.winnerId) {
            let currentRoundIndex = -1, currentMatchIndex = -1;
            for(let i = 0; i < newRounds.length; i++) {
                const matchIndex = newRounds[i].matches.findIndex(m => m.id === updatedMatch.id);
                if (matchIndex !== -1) { currentRoundIndex = i; currentMatchIndex = matchIndex; break; }
            }
            if (currentRoundIndex !== -1 && currentRoundIndex < newRounds.length - 1) {
                const nextRound = newRounds[currentRoundIndex + 1];
                const nextMatchIndex = Math.floor(currentMatchIndex / 2);
                const nextMatch = nextRound.matches[nextMatchIndex];
                if (nextMatch) {
                    const slot = currentMatchIndex % 2 === 0 ? 'teamAId' : 'teamBId';
                    nextMatch[slot] = updatedMatch.winnerId;
                }
            }
        }
        
        return { ...prev, [selectedSport]: { ...sportData, rounds: newRounds } };
    });
  };

  const handleUpdateTeams = (updatedTeams: Team[]) => {
    setTournaments(prev => ({ ...prev, [selectedSport]: { ...prev[selectedSport], teams: updatedTeams } }));
  };
  
  const handleResetTournament = () => {
    if (window.confirm(`Tem certeza que deseja resetar TODOS os dados do torneio de ${selectedSport}? Essa ação não pode ser desfeita.`)) {
        setTournaments(prev => ({ ...prev, [selectedSport]: createInitialData()[selectedSport] }));
    }
  };

  const teamsInUse = useMemo(() => {
    const ids = new Set<number>();
    currentTournament.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.teamAId) ids.add(match.teamAId);
        if (match.teamBId) ids.add(match.teamBId);
      });
    });
    return Array.from(ids);
  }, [currentTournament]);

  const managingMatch = useMemo(() => {
    if (!managingMatchId) return null;
    for (const round of currentTournament.rounds) {
      const match = round.matches.find(m => m.id === managingMatchId);
      if (match) return match;
    }
    return null;
  }, [managingMatchId, currentTournament]);

  const SportButton: React.FC<{sport: Sport, children: React.ReactNode}> = ({ sport, children }) => (
    <button
      onClick={() => { if (!isPublicView) setSelectedSport(sport); }}
      className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center space-x-2 ${selectedSport === sport ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700'} ${isPublicView ? 'cursor-default' : ''}`}
      disabled={isPublicView}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-indigo-400">Placar Pro</h1>
          
          <div className="flex items-center space-x-2 p-1 bg-gray-900/50 rounded-lg">
             <SportButton sport={Sport.Futsal}><FutsalIcon className="w-4 h-4" /><span>Futsal</span></SportButton>
             <SportButton sport={Sport.Volleyball}><VolleyballIcon className="w-4 h-4" /><span>Vôlei</span></SportButton>
          </div>

          <div className="flex items-center space-x-3">
            {isPublicView ? (
              <span className="text-sm font-semibold text-gray-300 px-3 py-2 bg-green-600/20 text-green-300 rounded-lg">Modo Espectador</span>
            ) : currentFiscal ? (
               <>
                <span className="text-sm text-gray-300 hidden md:block">Fiscal: <span className="font-bold text-indigo-400">{currentFiscal}</span></span>
                <button onClick={() => setIsShareModalOpen(true)} className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors">Compartilhar</button>
                <button onClick={() => setIsTeamModalOpen(true)} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors">Times</button>
                <button onClick={() => setIsChangePasswordModalOpen(true)} className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors">Senha</button>
                <button onClick={() => setIsHistoryModalOpen(true)} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">Histórico</button>
                <button onClick={handleResetTournament} className="px-4 py-2 text-sm bg-red-800 hover:bg-red-700 rounded-lg font-semibold transition-colors">Resetar</button>
                <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors">Sair</button>
               </>
            ) : (
              <button onClick={() => { setIsLoginModalOpen(true); setLoginError(null); }} className="flex items-center space-x-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors">
                <LockClosedIcon className="w-4 h-4" />
                <span>Modo Fiscal</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <BracketView 
          rounds={currentTournament.rounds} 
          teams={currentTournament.teams}
          isAdmin={!!currentFiscal && !isPublicView}
          onManageMatch={setManagingMatchId}
        />
      </main>

      {!isPublicView && <>
        <GameControlModal 
          match={managingMatch}
          teams={currentTournament.teams}
          onUpdate={handleUpdateMatch}
          onClose={() => setManagingMatchId(null)}
          actionLogs={actionLogs.filter(log => log.matchId === managingMatchId)}
        />
        <TeamManagementModal
          isOpen={isTeamModalOpen}
          teams={currentTournament.teams}
          teamsInUse={teamsInUse}
          onUpdateTeams={handleUpdateTeams}
          onClose={() => setIsTeamModalOpen(false)}
        />
        <LoginModal 
          isOpen={isLoginModalOpen}
          onClose={() => { setIsLoginModalOpen(false); setLoginError(null); }}
          onLogin={handleLogin}
          error={loginError}
        />
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          onChangePassword={handleChangePassword}
        />
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          logs={actionLogs}
          sessions={fiscalSessions}
          teams={tournaments[Sport.Futsal].teams.concat(tournaments[Sport.Volleyball].teams)}
        />
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          sport={selectedSport}
        />
      </>}
    </div>
  );
};

export default App;
