import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, UserPlus, ToggleLeft, ToggleRight, KeyRound, Search, Eye } from 'lucide-react';
import AddExecutiveModal from '../../components/manager/AddExecutiveModal';
import { TableSkeletonLoader } from '../../components/shared/SkeletonLoader'; // Import Skeleton
import EmptyState from '../../components/shared/EmptyState'; // Import EmptyState
import ExecutiveDetailsModal from '../../components/manager/ExecutiveDetailsModal';


const TeamManagementPage = () => {
  const [executives, setExecutives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState(null);

  const fetchExecutives = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/users');
      setExecutives(data);
    } catch (error) {
      toast.error('Failed to fetch team members.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // A small delay to better visualize the skeleton loader
    const timer = setTimeout(() => fetchExecutives(), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const toastId = toast.loading('Updating status...');
    try {
      await axiosInstance.patch(`/api/users/${id}/status`, { isActive: !currentStatus });
      toast.success('Status updated successfully!', { id: toastId });
      fetchExecutives();
    } catch (error) {
      toast.error('Failed to update status.', { id: toastId });
    }
  };

  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${name}?`)) return;
    const toastId = toast.loading('Resetting password...');
    try {
      const { data } = await axiosInstance.post(`/api/users/${id}/reset-password`);
      toast.success(`New Password: ${data.newPassword}`, { id: toastId, duration: 10000 });
    } catch (error) {
      toast.error('Failed to reset password.', { id: toastId });
    }
  };

  const filteredExecutives = executives.filter(exec =>
    exec.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AddExecutiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExecutives}
      />
      <ExecutiveDetailsModal
        isOpen={!!selectedExecutive}
        onClose={() => setSelectedExecutive(null)}
        executive={selectedExecutive}
      />
      <div className="rounded-2xl border border-black/10 bg-white">
        <div className="p-5 border-b border-black/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">All Executives</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2 text-sm font-medium tracking-tight hover:bg-[#b72828] transition"
            >
              <UserPlus className="w-4 h-4" /> Add Executive
            </button>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-medium" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-black/10 pl-9 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-medium bg-gray-light">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
                <th className="px-5 py-3 font-medium">Details</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeletonLoader rows={3} />
            ) : (
              <tbody>
                {filteredExecutives.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      <EmptyState
                        icon={Users}
                        title="No Executives Found"
                        message="Get started by adding a new sales executive to your team."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredExecutives.map((exec) => (
                    <tr key={exec._id} className="border-t border-black/5">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-dark">{exec.name}</div>
                        <div className="text-xs text-gray-medium">{exec.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${exec.isActive ? 'bg-pran-green/10 text-pran-green' : 'bg-pran-red/10 text-pran-red'}`}>
                          {exec.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleToggleStatus(exec._id, exec.isActive)} title={exec.isActive ? 'Deactivate' : 'Activate'}>
                            {exec.isActive ? <ToggleRight className="w-5 h-5 text-pran-green" /> : <ToggleLeft className="w-5 h-5 text-pran-red" />}
                          </button>
                          <button onClick={() => handleResetPassword(exec._id, exec.name)} title="Reset Password">
                            <KeyRound className="w-5 h-5 text-pran-yellow" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleToggleStatus(exec._id, exec.isActive)} /* ... */ />
                          <button onClick={() => handleResetPassword(exec._id, exec.name)} /* ... */ />
                          <button onClick={() => setSelectedExecutive(exec)} title="View Details">
                            <Eye className="w-5 h-5 text-pran-blue" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </>
  );
};

export default TeamManagementPage;