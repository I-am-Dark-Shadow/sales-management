import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const ExportModal = ({ isOpen, onClose, onExport, teams = [], showTeamFilter = false }) => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [teamId, setTeamId] = useState('all');
    const [isLoading, setIsLoading] = useState({ csv: false, pdf: false });

    if (!isOpen) return null;

    const handleExport = async (format) => {
        setIsLoading(prev => ({ ...prev, [format]: true }));
        await onExport(format, year, month, teamId);
        setIsLoading(prev => ({ ...prev, [format]: false }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center" onClick={onClose}>
            <div className="relative rounded-2xl bg-white p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-medium hover:text-gray-dark"><X className="w-5 h-5"/></button>
                <h3 className="text-lg font-semibold">Export Monthly Report</h3>
                <p className="text-sm text-gray-medium mt-1">Select the period and team for your report.</p>
                <div className="mt-4 space-y-3">
                    {showTeamFilter && (
                        <div>
                            <label className="text-xs font-medium">Filter by Team (Optional)</label>
                            <select value={teamId} onChange={e => setTeamId(e.target.value)} className="mt-1 w-full text-sm rounded-md border-black/10 bg-white px-2 py-2">
                                <option value="all">All Teams</option>
                                {teams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium">Month</label>
                            <select value={month} onChange={e => setMonth(e.target.value)} className="mt-1 w-full text-sm rounded-md border-black/10 bg-white px-2 py-2">
                                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">Year</label>
                            <select value={year} onChange={e => setYear(e.target.value)} className="mt-1 w-full text-sm rounded-md border-black/10 bg-white px-2 py-2">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={() => handleExport('csv')} disabled={isLoading.csv} className="inline-flex items-center justify-center gap-2 rounded-lg bg-pran-green text-white px-4 py-2.5 text-sm disabled:opacity-50">
                        <Download className="w-4 h-4"/> {isLoading.csv ? 'Generating...' : 'Download CSV'}
                    </button>
                    <button onClick={() => handleExport('pdf')} disabled={isLoading.pdf} className="inline-flex items-center justify-center gap-2 rounded-lg bg-pran-red text-white px-4 py-2.5 text-sm disabled:opacity-50">
                        <Download className="w-4 h-4"/> {isLoading.pdf ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;