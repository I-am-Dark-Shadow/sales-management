import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { X } from 'lucide-react';

const SetTargetModal = ({ isOpen, onClose, onSuccess, target }) => {
    const [executives, setExecutives] = useState([]);
    const [executiveId, setExecutiveId] = useState(null);
    const [amount, setAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!target;

    useEffect(() => {
        if (isOpen && !isEditing) {
            axiosInstance.get('/api/users').then(res => {
                setExecutives(res.data.map(e => ({ value: e._id, label: e.name })));
            });
        }
        
        if (isOpen && isEditing) {
            setExecutiveId({ value: target.executive._id, label: target.executive.name });
            setAmount(target.amount);
            setStartDate(new Date(target.startDate).toISOString().split('T')[0]);
            setEndDate(new Date(target.endDate).toISOString().split('T')[0]);
        }
    }, [isOpen, isEditing, target]);
    
    // This effect resets the form when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            setExecutiveId(null);
            setAmount('');
            setStartDate('');
            setEndDate('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading(isEditing ? "Updating target..." : "Setting target...");
        
        const payload = { amount, startDate, endDate, executiveId: executiveId.value };

        try {
            if (isEditing) {
                await axiosInstance.put(`/api/targets/${target._id}`, payload);
                toast.success("Target updated successfully!", { id: toastId });
            } else {
                await axiosInstance.post('/api/targets', payload);
                toast.success("Target set successfully!", { id: toastId });
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center" onClick={onClose}>
            <div className="relative rounded-2xl bg-white p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark"><X className="w-5 h-5"/></button>
                <h3 className="text-lg font-semibold">{isEditing ? 'Edit Target' : 'Set New Target'}</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <Select 
                        options={executives} 
                        value={executiveId} 
                        onChange={setExecutiveId} 
                        placeholder="Select an executive..." 
                        required 
                        isDisabled={isEditing} 
                    />
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Target Amount (RS)" required className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                    <div>
                        <label className="text-xs text-gray-medium">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mt-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-medium">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mt-1" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                        <button type="submit" disabled={isLoading} className="rounded-lg bg-pran-red text-white px-4 py-2 text-sm">
                            {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Set Target')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetTargetModal;