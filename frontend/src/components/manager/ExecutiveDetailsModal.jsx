import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import Calendar from 'react-calendar';
import { X, Calendar as CalendarIcon, Target, IndianRupee } from 'lucide-react';
import SkeletonLoader from '../shared/SkeletonLoader';

const ExecutiveDetailsModal = ({ isOpen, onClose, executive }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen && executive) {
            setIsLoading(true);
            axiosInstance.get(`/api/users/${executive._id}/details?date=${selectedDate}`)
                .then(res => setDetails(res.data))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, executive, selectedDate]);

    if (!isOpen) return null;

    const getTileClassName = ({ date, view }) => {
        if (view === 'month' && details?.attendance) {
            const record = details.attendance.find(d => new Date(d.date).toDateString() === date.toDateString());
            if (record) return record.status.toLowerCase().replace('-', '');
        }
    };

    const target = details?.target;
    const progressPercentage = target ? (target.achievedAmount / target.amount) * 100 : 0;
    const barWidth = Math.min(progressPercentage, 100);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start p-4 overflow-y-auto" onClick={onClose}>
            <div className="relative rounded-2xl bg-white w-full max-w-4xl mt-10" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark z-10"><X /></button>
                {isLoading ? <p className="p-6">Loading details...</p> :
                    <div>
                        <div className="p-6 border-b border-black/10 flex items-center gap-4">
                            <img src={details.user.profilePicture?.url || `https://ui-avatars.com/api/?name=${details.user.name}`} alt={details.user.name} className="w-16 h-16 rounded-full" />
                            <div>
                                <h3 className="text-xl font-semibold">{details.user.name}</h3>
                                <p className="text-gray-medium">{details.user.team?.name || "No Team Assigned"}</p>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: Sales & Target */}
                            <div className="space-y-6">
                                <div className="p-4 rounded-lg border">
                                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4" />Sales Summary</h4>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className="bg-gray-light p-2 rounded-md"><p className="text-xs">Today's Sales</p><p className="font-bold">RS {details.specificDateSales?.toLocaleString() ?? '0'}</p></div>
                                        <div className="bg-gray-light p-2 rounded-md"><p className="text-xs">Monthly Sales</p><p className="font-bold">RS {details.monthlySales.toLocaleString()}</p></div>
                                    </div>
                                    <div className="mt-3">
                                        <label className="text-xs">Check sales for a specific date:</label>
                                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md text-sm" />
                                        <p className="text-center mt-2 font-bold text-pran-green">Sales on {selectedDate}: RS {details.specificDateSales?.toLocaleString() ?? '0'}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg border">
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Target className="w-4 h-4" />Current Target</h4>
                                    {target ? (
                                        <div>
                                            <div className="w-full bg-gray-light rounded-full h-2.5 mt-2"><div className="bg-pran-green h-2.5 rounded-full" style={{ width: `${barWidth}%` }}></div></div>
                                            <p className="text-right text-xs text-gray-medium mt-1">RS {target.achievedAmount.toLocaleString()} / {target.amount.toLocaleString()}</p>
                                        </div>
                                    ) : <p className="text-sm text-gray-medium">No active target.</p>}
                                </div>
                            </div>
                            {/* Right Column: Attendance */}
                            <div className="p-4 rounded-lg border">
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4" />Attendance This Month</h4>
                                <Calendar value={new Date()} tileClassName={getTileClassName} />
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default ExecutiveDetailsModal;