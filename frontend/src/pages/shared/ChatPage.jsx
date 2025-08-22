import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import ChatWindow from '../../components/shared/ChatWindow';
import { MessageSquare } from 'lucide-react';

const ChatPage = () => {
    const { user } = useAuthStore();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        const fetchUserTeams = async () => {
            if (!user) return;

            if (user.role === 'MANAGER') {
                const { data } = await axiosInstance.get('/api/teams');
                setTeams(data);
                if(data.length > 0) setSelectedTeam(data[0]);
            } else { // Executive
                // UPDATED LOGIC: No more API call. We use the user object from our global store.
                // The 'team' object is now included thanks to our backend change.
                if (user.team) {
                    setTeams([user.team]);
                    setSelectedTeam(user.team);
                }
            }
        };
        fetchUserTeams();
    }, [user]);

    return (
        <div className="flex h-[calc(100vh-120px)] rounded-2xl border border-black/10 bg-white">
            <div className="w-1/4 border-r border-black/10">
                <h2 className="p-4 text-lg font-semibold tracking-tight border-b border-black/5">Teams</h2>
                <div className="p-2">
                    {teams.map(team => (
                        <button key={team._id} onClick={() => setSelectedTeam(team)} className={`w-full text-left px-3 py-2 rounded-md text-sm ${selectedTeam?._id === team._id ? 'bg-pran-red/10 text-pran-red' : 'hover:bg-gray-light'}`}>
                            {team.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-3/4 flex flex-col">
                {selectedTeam ? <ChatWindow team={selectedTeam} /> : 
                    <div className="flex-1 grid place-items-center text-gray-medium">
                        <div className="text-center">
                            <MessageSquare className="mx-auto h-12 w-12"/>
                            <p className="mt-2">Select a team to start chatting</p>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default ChatPage;