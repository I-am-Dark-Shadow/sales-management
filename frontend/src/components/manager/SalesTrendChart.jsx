import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

const SalesTrendChart = () => {
  const [data, setData] = useState([]);
  const [view, setView] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { view, year, month };
        const { data: responseData } = await axiosInstance.get('/api/dashboard/manager', { params });
        
        if(view === 'monthly') {
            const monthlyData = months.map((m, i) => ({ name: m, sales: 0 }));
            responseData.salesTrend.forEach(item => {
                monthlyData[item.month - 1].sales = item.sales;
            });
            setData(monthlyData);
        } else { // daily
            const daysInMonth = new Date(year, month, 0).getDate();
            const dailyData = Array.from({length: daysInMonth}, (_, i) => ({ name: i + 1, sales: 0 }));
            responseData.salesTrend.forEach(item => {
                dailyData[item.day - 1].sales = item.sales;
            });
            setData(dailyData);
        }
      } catch (error) {
        toast.error("Failed to load chart data.");
      }
    };
    fetchData();
  }, [view, year, month]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 h-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-medium tracking-tight">Sales Trends</h3>
          <p className="text-xs text-gray-medium">View sales totals by day or by month.</p>
        </div>
        <div className="flex items-center gap-2">
            <select value={view} onChange={e => setView(e.target.value)} className="text-sm rounded-md border-black/10 bg-white px-auto py-1">
                <option value="monthly">Month-wise</option>
                <option value="daily">Date-wise</option>
            </select>
            {view === 'daily' && (
                <select value={month} onChange={e => setMonth(e.target.value)} className="text-sm rounded-md border-black/10 bg-white px-auto py-1">
                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
            )}
            <select value={year} onChange={e => setYear(e.target.value)} className="text-sm rounded-md border-black/10 bg-white px-auto py-1">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1976D2" stopOpacity={0.1}/><stop offset="95%" stopColor="#1976D2" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#616161', fontSize: 12 }} />
            <YAxis tick={{ fill: '#616161', fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#1976D2" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesTrendChart;