import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Download, ChevronsRight } from 'lucide-react';
import ExportModal from '../../components/shared/ExportModal';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const ReportsPage = () => {
    const [sales, setSales] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: '',
        teamId: 'all'
    });

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const { data } = await axiosInstance.get('/api/teams');
                setTeams(data);
            } catch (error) {
                toast.error("Could not load teams list.");
            }
        };
        fetchTeams();
    }, []);

    useEffect(() => {
        const fetchSales = async () => {
            setIsLoading(true);
            try {
                const { data } = await axiosInstance.get('/api/sales/team-sales', { params: filters });
                setSales(data);
            } catch (error) {
                toast.error("Failed to load team sales data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSales();
    }, [filters]);
    
    const grandTotal = useMemo(() => {
        return sales.reduce((total, sale) => total + sale.amount, 0);
    }, [sales]);

    const handleExport = async (format, year, month, teamId) => {
        const toastId = toast.loading(`Exporting ${format.toUpperCase()}...`);
        try {
            const params = { year, month, teamId };
            const response = await axiosInstance.get(`/api/reports/team-sales/${format}`, { responseType: 'blob', params });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `team-sales-${year}-${month}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Download started!", { id: toastId });
        } catch (error) {
            toast.error("Export failed.", { id: toastId });
        }
    };

    return (
        <>
        <ExportModal 
            isOpen={isExportModalOpen} 
            onClose={() => setIsExportModalOpen(false)} 
            onExport={handleExport}
            teams={teams}
            showTeamFilter={true}
        />
        <div className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
                <h2 className="text-xl font-semibold tracking-tight">Team Sales Report</h2>
                <div className="flex items-center gap-2">
                    <select value={filters.teamId} onChange={e => setFilters({...filters, teamId: e.target.value, date: ''})} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
                        <option value="all">All Teams</option>
                        {teams.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
                    </select>
                    <select value={filters.month} onChange={e => setFilters({...filters, month: e.target.value, date: ''})} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={filters.year} onChange={e => setFilters({...filters, year: e.target.value, date: ''})} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <input type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} className="text-sm rounded-md border-black/10 bg-white px-auto py-2" />
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button onClick={() => setIsExportModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-pran-green text-white px-4 py-2 text-sm">
                    <Download className="w-4 h-4"/> Export Monthly Report
                </button>
            </div>
            
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-light">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-left">Date</th>
                            <th className="px-4 py-3 font-semibold text-left">Executive</th>
                            <th className="px-4 py-3 font-semibold text-left">Location</th>
                            <th className="px-4 py-3 font-semibold text-left">Products Sold</th>
                            <th className="px-4 py-3 font-semibold text-right">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (<tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>) :
                         sales.length > 0 ? sales.map(sale => (
                            <tr key={sale._id} className="border-b">
                                <td className="px-4 py-3 align-top">{new Date(sale.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 align-top font-medium">{sale.executiveId?.name}</td>
                                <td className="px-4 py-3 align-top">{sale.location}</td>
                                <td className="px-4 py-3">
                                    {sale.products.map(item => (
                                        <div key={item._id} className="flex justify-between items-center py-1 not-last:border-b">
                                            <div className="flex items-center gap-2">
                                                <ChevronsRight className="w-4 h-4 text-pran-red"/>
                                                <span>{item.productId?.name || 'N/A'}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">({item.quantity} x {item.pricePerUnit}) = <strong>{(item.quantity * item.pricePerUnit).toLocaleString()}</strong></span>
                                        </div>
                                    ))}
                                </td>
                                <td className="px-4 py-3 align-top text-right font-semibold">RS {sale.amount.toLocaleString()}</td>
                            </tr>
                        )) : (<tr><td colSpan="5" className="text-center py-8 text-gray-medium">No sales found for the selected period.</td></tr>)}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-gray-light">
                            <td colSpan="4" className="px-4 py-3 text-right">Grand Total</td>
                            <td className="px-4 py-3 text-right text-pran-green">RS {grandTotal.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        </>
    );
};

export default ReportsPage;