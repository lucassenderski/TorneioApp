import React, { useState, useEffect } from 'react';
import type { Team } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon } from './icons';

interface TeamManagementModalProps {
  isOpen: boolean;
  teams: Team[];
  teamsInUse: number[]; // IDs of teams currently in a match
  onUpdateTeams: (updatedTeams: Team[]) => void;
  onClose: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({ isOpen, teams, teamsInUse, onUpdateTeams, onClose }) => {
  const [localTeams, setLocalTeams] = useState<Team[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalTeams(JSON.parse(JSON.stringify(teams))); 
    }
  }, [isOpen, teams]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateTeams(localTeams);
    onClose();
  };

  const handleAddTeam = () => {
    if (newTeamName.trim() === '') return;
    const newId = localTeams.length > 0 ? Math.max(...localTeams.map(t => t.id)) + 1 : 1;
    setLocalTeams([...localTeams, { id: newId, name: newTeamName.trim() }]);
    setNewTeamName('');
  };

  const handleDeleteTeam = (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este time? Essa ação não pode ser desfeita.')) {
        setLocalTeams(localTeams.filter(team => team.id !== id));
    }
  };

  const startEditing = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingName(team.name);
  };
  
  const cancelEditing = () => {
    setEditingTeamId(null);
    setEditingName('');
  };

  const saveEdit = (id: number) => {
    if (editingName.trim() === '') return;
    setLocalTeams(localTeams.map(team =>
      team.id === id ? { ...team, name: editingName.trim() } : team
    ));
    cancelEditing();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, callback: () => void) => {
    if (e.key === 'Enter') {
      callback();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Gerenciar Times</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </header>

        <div className="overflow-y-auto p-4 space-y-4">
          {/* Add Team */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddTeam)}
              placeholder="Nome do novo time"
              className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={handleAddTeam} className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-md flex items-center justify-center">
              <PlusIcon />
            </button>
          </div>
          
          <hr className="border-gray-600" />
          
          {/* Team List */}
          <ul className="space-y-2">
            {localTeams.map(team => {
              const isTeamInUse = teamsInUse.includes(team.id);
              return (
              <li key={team.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                {editingTeamId === team.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => saveEdit(team.id))}
                    className="bg-gray-600 border border-gray-500 rounded-md px-2 py-1 flex-grow"
                    autoFocus
                  />
                ) : (
                  <span className="font-semibold">{team.name}</span>
                )}
                
                <div className="flex items-center space-x-2">
                  {editingTeamId === team.id ? (
                    <>
                      <button onClick={() => saveEdit(team.id)} className="text-green-400 hover:text-green-300"><CheckIcon /></button>
                      <button onClick={cancelEditing} className="text-red-400 hover:text-red-300"><XIcon /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(team)} className="text-yellow-400 hover:text-yellow-300"><PencilIcon /></button>
                      <button 
                        onClick={() => handleDeleteTeam(team.id)} 
                        className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isTeamInUse}
                        title={isTeamInUse ? "Este time não pode ser removido pois está em uma partida." : "Remover time"}
                      >
                        <TrashIcon />
                      </button>
                    </>
                  )}
                </div>
              </li>
            )})}
          </ul>
        </div>

        <footer className="p-4 border-t border-gray-700 mt-auto flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 font-semibold transition-colors">Salvar Alterações</button>
        </footer>
      </div>
    </div>
  );
};
