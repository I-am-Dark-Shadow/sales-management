import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const MyTargetsPage = () => {
    const [targets, setTargets] = useState([]);
    useEffect(() => {
        axiosInstance.get('/api/targets/my')
            .then(res => setTargets(res.data))
            .catch(() => toast.error("Could not fetch targets."));
    }, []);

    const getStatusClass = (status) => {
        if (status === 'Achieved') return 'bg-pran-green/10 text-pran-green';
        if (status === 'Not Achieved') return 'bg-pran-red/10 text-pran-red';
        return 'bg-pran-blue/10 text-pran-blue';
    };

    return (
        <div className="rounded-2xl border border-black/10 bg-white p-5">
            <h2 className="text-xl font-semibold tracking-tight mb-6">My Sales Targets</h2>
            <div className="space-y-4">
                {targets.map(target => {

                    const progressPercentage = (target.achievedAmount / target.amount) * 100;
                    const barWidth = Math.min(progressPercentage, 100);
                    const extraAmount = target.achievedAmount > target.amount ? target.achievedAmount - target.amount : 0;

                    return (
                        <div key={target._id} className="p-4 rounded-lg border border-black/10">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold">{target.period}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(target.status)}`}>
                                    {target.achievedAmount >= target.amount ? 'Achieved' : target.status}
                                </span>
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
                                    {/* Conditionally render extra amount */}
                                    {extraAmount > 0 ? (
                                        <p className="text-left text-xs text-pran-blue font-medium mt-1">
                                            Extra Sales: RS {extraAmount.toLocaleString()}
                                        </p>
                                    ) : <div /> /* Empty div to keep alignment */}
                                    <p className="text-right text-xs text-gray-medium mt-1">
                                        RS {target.achievedAmount.toLocaleString()} / {target.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {targets.length === 0 && <p className="text-center py-8 text-gray-medium">You have not been assigned any targets yet.</p>}
            </div>
        </div>
    );
};

export default MyTargetsPage;