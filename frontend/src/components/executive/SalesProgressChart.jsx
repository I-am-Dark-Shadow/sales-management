import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LucideLineChart } from 'lucide-react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();

const SalesProgressChart = () => {
    const [data, setData] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed for array
    const [year, setYear] = useState(currentYear);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // month is 0-indexed, but API expects 1-indexed
                const { data: salesData } = await axiosInstance.get(`/api/analytics/sales-progress?month=${month + 1}&year=${year}`);
                
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const chartData = Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const saleForDay = salesData.find(d => d.day === day);
                    return { name: day, Sales: saleForDay ? saleForDay.sales : 0 };
                });
                setData(chartData);
            } catch (error) {
                toast.error("Failed to load chart data.");
            }
        };
        fetchData();
    }, [month, year]);

    // This calculates the position for the color change in the gradient
    const maxSales = Math.max(...data.map(d => d.Sales), 101); // Get max value for scaling, ensure it's at least 201
    const offset = 500 / maxSales;

    return (
        <div className="rounded-2xl border border-black/10 bg-white p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium tracking-tight">Sales Progress</h3>
                    <p className="text-xs text-gray-medium">Daily totals for the selected month</p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="text-sm rounded-md border-black/10 bg-white px-auto py-1">
                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    {/* In the future, you can add a year selector here as well */}
                </div>
            </div>
            <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={offset} stopColor="#388E3C" stopOpacity={1}/>
                                <stop offset={offset} stopColor="#D32F2F" stopOpacity={1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="name" tick={{ fill: '#616161', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#616161', fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="Sales" stroke="url(#splitColor)" fill="url(#splitColor)" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesProgressChart;