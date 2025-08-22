import React, { useEffect, useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import { Banknote, Users, Calendar, CheckCircle2 } from 'lucide-react';
import SalesTrendChart from '../../components/manager/SalesTrendChart';
import axiosInstance from '../../api/axios';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/api/dashboard/manager');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Sales (This Month)"
          value={`₹ ${stats?.totalSales.toLocaleString() || 0}`}
          icon={Banknote}
          iconBgColor="bg-pran-blue"
        />
        <StatCard
          title="Team Size"
          value={stats?.teamSize || 0}
          icon={Users}
          iconBgColor="bg-pran-green"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaves || 0}
          change={stats?.pendingLeaves > 0 ? "Needs attention" : "All clear"}
          icon={Calendar}
          iconBgColor="bg-pran-yellow"
          changeColor={stats?.pendingLeaves > 0 ? "text-pran-yellow" : "text-pran-green"}
        />
        <StatCard
          title="Approvals"
          value={stats?.approvalsThisWeek || 0} 
          change="This week"
          icon={CheckCircle2}
          iconBgColor="bg-pran-red"
          changeColor="text-gray-medium"
        />
      </div>

      <SalesTrendChart salesTrendData={stats?.salesTrend} />
    </div>
  );
};

export default ManagerDashboard;