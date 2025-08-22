import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = { present: '#388E3C', leave: '#D32F2F', absent: '#D32F2F', halfday: '#FFA000' };
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const AttendanceChart = () => {
  const [chartData, setChartData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // API expects 1-indexed month
        const { data } = await axiosInstance.get(`/api/analytics/attendance-summary?month=${month + 1}&year=${year}`);

        const formattedData = [
          { name: 'Present', value: data.present || 0 },
          { name: 'Leave/Absent', value: (data.leave || 0) + (data.absent || 0) },
          { name: 'Halfday', value: data.halfday || 0 },
        ].filter(item => item.value > 0); // Only show categories with data

        setChartData(formattedData);
      } catch (error) {
        toast.error("Failed to load chart data.");
      }
    };
    fetchData();
  }, [month, year]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium tracking-tight">Attendance & Leaves</h3>
          <p className="text-xs text-gray-medium">Summary for the selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="text-sm rounded-md border-black/10 bg-white px-auto py-1">
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="text-sm rounded-md border-black/10 bg-white px-auto py-1">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.length > 0 ? chartData : [{ name: "No Data", value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, value }) =>
                chartData.length > 0 ? `${value} day(s)` : "0 attendance"
              }
            >
              {(chartData.length > 0 ? chartData : [{ name: "No Data", value: 1 }]).map(
                (entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      chartData.length > 0
                        ? COLORS[entry.name.split("/")[0].toLowerCase()]
                        : "#e5e7eb" // gray for empty chart
                    }
                  />
                )
              )}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default AttendanceChart;