import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react';

const TeamManagementCard = () => {
  const [executives, setExecutives] = useState([]);

  const fetchExecutives = async () => {
    try {
      const { data } = await axiosInstance.get('/api/users');
      setExecutives(data);
    } catch (error) {
      toast.error('Failed to fetch team members.');
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);
  
  const handleToggleStatus = async (id, currentStatus) => {
    const toastId = toast.loading('Updating status...');
    try {
      await axiosInstance.patch(`/api/users/${id}/status`, { isActive: !currentStatus });
      toast.success('Status updated successfully!', { id: toastId });
      fetchExecutives(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update status.', { id: toastId });
    }
  };
  
  const handleResetPassword = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reset the password for ${name}?`)) return;
    
    const toastId = toast.loading('Resetting password...');
    try {
        const { data } = await axiosInstance.post(`/api/users/${id}/reset-password`);
        toast.success(`New Password: ${data.newPassword}`, { id: toastId, duration: 10000 }); // Show for 10s
    } catch (error) {
        toast.error('Failed to reset password.', { id: toastId });
    }
  };


  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="font-medium tracking-tight">Team Management</div>
        <button className="flex items-center gap-2 text-sm text-pran-blue hover:underline">
          <UserPlus className="w-4 h-4" /> Add Executive
        </button>
      </div>
      <div className="mt-4 -mx-5 border-t border-black/10">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-medium">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {executives.map((exec) => (
              <tr key={exec._id} className="border-t border-black/5">
                <td className="px-5 py-3">
                  <div className="font-medium">{exec.name}</div>
                  <div className="text-xs text-gray-medium">{exec.email}</div>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${exec.isActive ? 'bg-pran-green/10 text-pran-green' : 'bg-pran-red/10 text-pran-red'}`}>
                    {exec.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleStatus(exec._id, exec.isActive)} title={exec.isActive ? 'Deactivate' : 'Activate'}>
                      {exec.isActive 
                        ? <ToggleRight className="w-5 h-5 text-pran-green" /> 
                        : <ToggleLeft className="w-5 h-5 text-pran-red" />}
                    </button>
                     <button onClick={() => handleResetPassword(exec._id, exec.name)} title="Reset Password">
                        <KeyRound className="w-5 h-5 text-pran-yellow" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
             {executives.length === 0 && (
                <tr>
                    <td colSpan="3" className="text-center py-10 text-gray-medium">No executives found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamManagementCard;