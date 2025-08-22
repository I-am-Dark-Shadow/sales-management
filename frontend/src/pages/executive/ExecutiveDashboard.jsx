import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import StatCard from '../../components/manager/StatCard';
import { Banknote, BarChart3, Target, CalendarDays } from 'lucide-react';
import AttendanceChart from '../../components/executive/AttendanceChart';
import SalesProgressChart from '../../components/executive/SalesProgressChart';

const ExecutiveDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/api/dashboard/executive');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch executive stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  const getStatusColor = (status) => {
    if (status === "On track") return "text-pran-green";
    if (status === "Needs Improvement") return "text-pran-yellow";
    if (status === "At Risk") return "text-pran-red";
    return "text-gray-medium";
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today’s Sales" value={`₹ ${stats?.todaySales.toLocaleString() || 0}`} icon={Banknote} iconBgColor="bg-pran-blue" />
        <StatCard title="Monthly Sales" value={`₹ ${stats?.monthlySales.toLocaleString() || 0}`} icon={BarChart3} iconBgColor="bg-pran-blue" />
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="flex items-center justify-between"><div className="text-sm text-gray-medium">Target Progress</div><Target className="w-4 h-4 text-pran-blue" /></div>
          {stats?.target ? (
            <>
              <div className="mt-2 h-2 rounded-full bg-gray-light overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-pran-green to-pran-blue" style={{ width: `${stats.target.progress.toFixed(0)}%` }}></div>
              </div>
              <div className="mt-1 text-xs text-gray-medium">
                <span className="font-medium text-gray-dark">RS {stats.target.achieved.toLocaleString()}</span> of RS {stats.target.amount.toLocaleString()}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-medium">No active target set.</p>
          )}
        </div>
        <StatCard
          title="Attendance"
          value={`${stats?.attendancePercentage?.toFixed(0) || 0}%`}
          change={stats?.attendanceStatus || 'No data'}
          changeColor={getStatusColor(stats?.attendanceStatus)}
          icon={CalendarDays}
          iconBgColor="bg-pran-blue"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-black/10 bg-white p-5">
          <h3 className="font-medium tracking-tight">Sales Progress</h3>
          <SalesProgressChart />

        </div>
        <AttendanceChart />
      </div>
    </div>
  );
};

export default ExecutiveDashboard;