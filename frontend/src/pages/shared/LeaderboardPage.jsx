import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Trophy } from 'lucide-react';
import SkeletonLoader from '../../components/shared/SkeletonLoader';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(`/api/leaderboard?period=${period}`);
        setLeaderboard(data);
      } catch (error) {
        toast.error('Failed to load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const getRankColor = (rank) => {
    if (rank === 0) return 'text-yellow-500'; // 1st place
    if (rank === 1) return 'text-gray-400'; // 2nd place
    if (rank === 2) return 'text-yellow-700'; // 3rd place
    return 'text-gray-500';
  };

  const periods = [
    { key: 'monthly', label: 'This Month' },
    { key: 'yearly', label: 'This Year' },
    { key: 'alltime', label: 'All Time' },
  ];

  const LeaderboardSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
            <SkeletonLoader className="h-8 w-8" />
            <SkeletonLoader className="h-10 w-10 rounded-full" />
            <div className="flex-1">
                <SkeletonLoader className="h-4 w-1/3" />
            </div>
            <SkeletonLoader className="h-6 w-1/4" />
        </div>
    ))
  );

  return (
    <div className="rounded-2xl border border-black/10 bg-white max-w-4xl mx-auto">
      <div className="p-5 border-b border-black/10">
        <h2 className="text-xl font-semibold tracking-tight">Performance Leaderboard</h2>
        <p className="text-sm text-gray-medium mt-1">Ranking of top sales executives based on total sales.</p>
        <div className="mt-4 flex items-center gap-2">
            {periods.map(p => (
                <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${period === p.key ? 'bg-pran-red text-white' : 'bg-gray-light hover:bg-gray-200'}`}>
                    {p.label}
                </button>
            ))}
        </div>
      </div>

      <div className="divide-y divide-black/5">
        {isLoading ? <LeaderboardSkeleton /> :
          leaderboard.map((entry, index) => (
            <div key={entry.executiveId} className="flex items-center gap-4 p-4">
              <div className={`w-8 text-center font-bold text-lg ${getRankColor(index)}`}>
                {index < 3 ? <Trophy className="mx-auto w-6 h-6 fill-current" /> : index + 1}
              </div>
              <img src={entry.profilePicture?.url || `https://ui-avatars.com/api/?name=${entry.name}`} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 font-medium text-gray-dark">{entry.name}</div>
              <div className="text-lg font-semibold text-pran-green">
                RS {entry.totalSales.toLocaleString()}
              </div>
            </div>
          ))
        }
        {!isLoading && leaderboard.length === 0 && <p className="text-center py-10 text-gray-medium">No sales data available for this period.</p>}
      </div>
    </div>
  );
};

export default LeaderboardPage;