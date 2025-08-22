import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { X } from 'lucide-react';

const ManageTeamModal = ({ isOpen, onClose, onSuccess, team }) => {
  const [executives, setExecutives] = useState([]); // All execs under this manager
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch all executives to populate the dropdown
      const fetchAllExecutives = async () => {
        const { data } = await axiosInstance.get('/api/users');
        setExecutives(data);
      };
      fetchAllExecutives();
      
      // Set the currently selected members for the team being edited
      if (team && team.members) {
        setSelectedMembers(team.members.map(m => ({ value: m._id, label: m.name })));
      }
    }
  }, [isOpen, team]);

  if (!isOpen) return null;

  // Format options for react-select, disabling those already in another team
  const executiveOptions = executives.map(exec => ({
    value: exec._id,
    label: `${exec.name} ${exec.team && exec.team._id !== team._id ? `(${exec.team.name})` : ''}`,
    isDisabled: exec.team && exec.team._id !== team._id, // Disable if in another team
  }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Updating team members...");
    try {
        const memberIds = selectedMembers.map(m => m.value);
        await axiosInstance.put(`/api/teams/${team._id}/members`, { memberIds });
        toast.success("Team updated successfully!", { id: toastId });
        onSuccess();
        onClose();
    } catch (error) {
        toast.error("Failed to update team.", { id: toastId });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center" onClick={onClose}>
      <div className="relative rounded-2xl bg-white p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-semibold tracking-tight">Manage Members for "{team.name}"</h3>
        <p className="text-sm text-gray-medium mt-1">Assign or unassign executives. Members already in other teams are disabled.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Select
                isMulti
                options={executiveOptions}
                value={selectedMembers}
                onChange={setSelectedMembers}
                className="text-sm"
                classNamePrefix="select"
            />
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-black/10 px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={isLoading} className="rounded-lg bg-pran-red text-white px-4 py-2 text-sm hover:bg-[#b72828] transition">
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ManageTeamModal;