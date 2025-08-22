import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SetTargetModal from '../../components/manager/SetTargetModal';
import EmptyState from '../../components/shared/EmptyState';
import { Target } from 'lucide-react';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const TargetsPage = () => {
  const [targets, setTargets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('In Progress');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTarget, setSelectedTarget] = useState(null);

  const fetchTargets = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/targets/team?year=${selectedYear}&month=${selectedMonth}`);
      setTargets(data);
    } catch (error) {
      toast.error("Failed to fetch targets.");
    }
  };

  useEffect(() => {
    fetchTargets();
  }, [selectedMonth, selectedYear]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTarget(null);
  };
  
  const handleModalSuccess = () => {
    handleModalClose();
    fetchTargets();
  };

  const handleDelete = async (targetId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/targets/${targetId}`);
      toast.success("Target deleted!");
      fetchTargets();
    } catch (error) {
      toast.error("Failed to delete target.");
    }
  };

  const filteredTargets = targets.filter(t => t.status === activeTab);

  const getStatusClass = (status) => {
    if (status === 'Achieved') return 'bg-pran-green/10 text-pran-green';
    if (status === 'Not Achieved') return 'bg-pran-red/10 text-pran-red';
    return 'bg-pran-blue/10 text-pran-blue';
  };

  return (
    <>
      <SetTargetModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleModalSuccess}
        target={selectedTarget}
      />
      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Team Target Setting</h2>
            <div className="flex items-center gap-2">
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2 text-sm">
                    <Plus className="w-4 h-4" /> Set New Target
                </button>
            </div>
        </div>

        <div className="border-b border-black/10 mt-4">
          <nav className="-mb-px flex space-x-6">
            <button onClick={() => setActiveTab('In Progress')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'In Progress' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>In Progress</button>
            <button onClick={() => setActiveTab('Achieved')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Achieved' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>Achieved</button>
            <button onClick={() => setActiveTab('Not Achieved')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Not Achieved' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>Not Achieved</button>
          </nav>
        </div>

        <div className="mt-4 space-y-3">
          {filteredTargets.length > 0 ? (
            filteredTargets.map(target => {
              const progressPercentage = (target.amount > 0) ? (target.achievedAmount / target.amount) * 100 : 0;
              const barWidth = Math.min(progressPercentage, 100);
              const extraAmount = target.achievedAmount > target.amount ? target.achievedAmount - target.amount : 0;

              return (
                <div key={target._id} className="p-4 rounded-lg border border-black/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{target.executive.name}</p>
                      <p className="text-sm text-gray-medium">{target.period}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(target.status)}`}>
                        {target.status}
                      </span>
                      <button onClick={() => { setSelectedTarget(target); setIsModalOpen(true); }} title="Edit Target">
                          <Edit className="w-4 h-4 text-pran-blue"/>
                      </button>
                      <button onClick={() => handleDelete(target._id)} title="Delete Target">
                          <Trash2 className="w-4 h-4 text-pran-red"/>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-light rounded-full h-2.5">
                      <div className="bg-pran-green h-2.5 rounded-full" style={{ width: `${barWidth}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      {extraAmount > 0 ? (
                        <p className="text-left text-xs text-pran-blue font-medium mt-1">
                          Extra Sales: RS {extraAmount.toLocaleString()}
                        </p>
                      ) : <div />}
                      <p className="text-right text-xs text-gray-medium mt-1">
                        RS {target.achievedAmount.toLocaleString()} / {target.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState 
                icon={Target}
                title="No Targets Found"
                message="No targets match the current filter criteria."
            />
          )}
        </div>
      </div>
    </>
  );
};

export default TargetsPage;