import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import ManageTeamModal from '../../components/manager/ManageTeamModal'; // We will create this

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/teams');
      setTeams(data);
    } catch (error) {
      toast.error("Failed to fetch teams.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async () => {
    const name = prompt("Enter new team name:");
    if (name) {
      try {
        await axiosInstance.post('/api/teams', { name });
        toast.success(`Team "${name}" created!`);
        fetchTeams();
      } catch (error) {
        toast.error("Failed to create team.");
      }
    }
  };
  
  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete the team "${teamName}"? This will unassign all its members.`)) return;
    try {
        await axiosInstance.delete(`/api/teams/${teamId}`);
        toast.success('Team deleted successfully.');
        fetchTeams();
    } catch(error) {
        toast.error('Failed to delete team.');
    }
  }

  return (
    <>
      <ManageTeamModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSuccess={fetchTeams}
        team={selectedTeam}
      />
      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Manage Teams</h2>
          <button onClick={handleCreateTeam} className="inline-flex items-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2 text-sm font-medium hover:bg-[#b72828] transition">
            <Plus className="w-4 h-4" /> Create Team
          </button>
        </div>
        
        {isLoading ? <p>Loading teams...</p> : teams.length === 0 ? <EmptyState icon={Users} title="No Teams Found" message="Create your first team to start organizing your executives." /> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team._id} className="rounded-lg border border-black/10 p-4 flex flex-col">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-dark">{team.name}</h3>
                    <p className="text-sm text-gray-medium">{team.members.length} member(s)</p>
                    <div className="text-xs mt-2 space-y-1">
                        {team.members.slice(0, 3).map(m => <p key={m._id} className="truncate">{m.name}</p>)}
                        {team.members.length > 3 && <p className="text-gray-medium">...and {team.members.length - 3} more.</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/5">
                    <button onClick={() => { setSelectedTeam(team); setIsManageModalOpen(true); }} className="text-sm text-pran-blue hover:underline">Manage Members</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleDeleteTeam(team._id, team.name)} className="text-sm text-pran-red hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </>
  );
};

export default TeamsPage;