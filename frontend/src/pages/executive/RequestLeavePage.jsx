import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const RequestLeavePage = () => {
    const [formData, setFormData] = useState({ startDate: '', endDate: '', reason: '' });
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data } = await axiosInstance.get('/api/leaves/my-history');
            setHistory(data);
        };
        fetchHistory();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Submitting request...');
        try {
            await axiosInstance.post('/api/leaves/apply', formData);
            toast.success('Leave request submitted!', { id: toastId });
            setFormData({ startDate: '', endDate: '', reason: '' }); // Reset form
            const { data } = await axiosInstance.get('/api/leaves/my-history'); // Refresh history
            setHistory(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusClass = (status) => {
      switch (status) {
        case 'APPROVED': return 'bg-pran-green/10 text-pran-green';
        case 'REJECTED': return 'bg-pran-red/10 text-pran-red';
        default: return 'bg-pran-yellow/10 text-pran-yellow';
      }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-tight">Request Leave</h2>
                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" />
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" />
                    <textarea placeholder="Reason for leave" name="reason" value={formData.reason} onChange={handleChange} required className="col-span-2 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 ring-pran-blue/30" rows="4"></textarea>
                    <button type="submit" disabled={isLoading} className="col-span-2 rounded-lg bg-pran-red text-white px-4 py-2.5 text-sm hover:bg-[#b72828] transition disabled:opacity-50">
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold tracking-tight">Leave History</h2>
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                    {history.map(item => (
                        <div key={item._id} className="p-3 rounded-lg border border-black/10">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium">{new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>{item.status}</span>
                            </div>
                            <p className="text-xs text-gray-medium mt-1">{item.reason}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RequestLeavePage;