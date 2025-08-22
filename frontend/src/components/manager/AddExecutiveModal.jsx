import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Select from 'react-select';


const AddExecutiveModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch teams to populate the dropdown
      const fetchTeams = async () => {
        const { data } = await axiosInstance.get('/api/teams');
        setTeams(data.map(t => ({ value: t._id, label: t.name })));
      };
      fetchTeams();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Registering executive...');
    try {
      await axiosInstance.post('/api/auth/register', { name, email, password, teamId: teamId?.value });
      toast.success('Executive registered successfully!', { id: toastId });
      onSuccess(); // Callback to refresh the parent component's data
      onClose(); // Close the modal
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center" onClick={onClose}>
      <div className="relative rounded-2xl bg-white p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold tracking-tight">Register New Sales Executive</h3>
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" />
          <Select
            options={teams}
            value={teamId}
            onChange={setTeamId}
            placeholder="Assign to a team (Optional)"
            isClearable
            className="text-sm"
            classNamePrefix="select"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 transition">Cancel</button>
            <button type="submit" disabled={isLoading} className="rounded-lg bg-pran-red text-white px-4 py-2 text-sm hover:bg-[#b72828] transition disabled:opacity-50">
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExecutiveModal;