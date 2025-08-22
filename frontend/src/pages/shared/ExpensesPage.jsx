import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expense'); // To toggle forms/history

  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Travel', amount: '', description: '' });
  const [incomeForm, setIncomeForm] = useState({ date: new Date().toISOString().split('T')[0], source: '', amount: '', description: '' });
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [expensesRes, incomesRes, summaryRes] = await Promise.all([
        axiosInstance.get('/api/expenses'),
        axiosInstance.get('/api/incomes'),
        axiosInstance.get(`/api/dashboard/financial-summary?year=${year}`),
      ]);
      setExpenses(expensesRes.data);
      setIncomes(incomesRes.data);
      setSummaryData(summaryRes.data);
    } catch (error) {
      toast.error("Failed to fetch financial data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding expense...");
    try {
      await axiosInstance.post('/api/expenses', expenseForm);
      toast.success("Expense added!", { id: toastId });
      setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'Travel', amount: '', description: '' });
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add expense.', { id: toastId }); }
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding income...");
    try {
      await axiosInstance.post('/api/incomes', incomeForm);
      toast.success("Income added!", { id: toastId });
      setIncomeForm({ date: new Date().toISOString().split('T')[0], source: '', amount: '', description: '' });
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add income.', { id: toastId }); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axiosInstance.delete(`/api/${type}s/${id}`); // e.g., /api/expenses/:id
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted!`);
      fetchData();
    } catch (error) { toast.error(`Failed to delete ${type}.`); }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white p-5 h-[400px]">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">Yearly Financial Summary</h2>
                <p className="text-sm text-gray-medium">Your income vs. expenses for the selected year.</p>
            </div>
            <select value={year} onChange={e => setYear(e.target.value)} className="text-sm rounded-md border-black/10 bg-white px-2 py-1">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={summaryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="name" tick={{ fill: '#616161', fontSize: 12 }} />
            <YAxis tick={{ fill: '#616161', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#388E3C" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#D32F2F" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Add Income Form */}
          <div className="rounded-2xl border border-black/10 bg-white p-5 self-start">
            <h2 className="text-lg font-semibold tracking-tight">Add New Income</h2>
            <form onSubmit={handleIncomeSubmit} className="mt-4 space-y-4">
              <div><label className="text-sm font-medium">Date</label><input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} required className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" /></div>
              <div><label className="text-sm font-medium">Amount (RS)</label><input type="number" placeholder="e.g., 50000" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} required className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" /></div>
              <div><label className="text-sm font-medium">Source</label><input type="text" placeholder="e.g., Salary, Commission" value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} required className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" /></div>
              <button type="submit" className="w-full rounded-lg bg-pran-green text-white px-4 py-2.5 text-sm hover:opacity-90 transition">Add Income</button>
            </form>
          </div>
          {/* Add Expense Form */}
          <div className="rounded-2xl border border-black/10 bg-white p-5 self-start">
            <h2 className="text-lg font-semibold tracking-tight">Add New Expense</h2>
            <form onSubmit={handleExpenseSubmit} className="mt-4 space-y-4">
              {/* ... form inputs are the same as before ... */}
              <div><label className="text-sm font-medium">Date</label><input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" /></div>
              <div><label className="text-sm font-medium">Amount (RS)</label><input type="number" placeholder="e.g., 500" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" /></div>
              <div><label className="text-sm font-medium">Category</label><select name="category" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} required className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm bg-white"><option>Travel</option><option>Food</option><option>Supplies</option><option>Utilities</option><option>Other</option></select></div>
              <div><label className="text-sm font-medium">Description (Optional)</label><textarea value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} rows="2" className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" /></div>
              <button type="submit" className="w-full rounded-lg bg-pran-red text-white px-4 py-2.5 text-sm hover:bg-[#b72828] transition">Add Expense</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white p-5">
          <div className="border-b border-black/10"><nav className="-mb-px flex space-x-6"><button onClick={() => setActiveTab('expense')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'expense' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>Expense History</button><button onClick={() => setActiveTab('income')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'income' ? 'border-pran-green text-pran-green' : 'border-transparent text-gray-medium'}`}>Income History</button></nav></div>
          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
            {activeTab === 'expense' && (expenses.map(exp => (<div key={exp._id} className="p-3 rounded-lg border border-black/10 flex justify-between items-start"><div><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pran-blue/10 text-pran-blue">{exp.category}</span><p className="font-semibold text-gray-dark mt-1">RS {exp.amount.toLocaleString()}</p><p className="text-xs text-gray-medium">{new Date(exp.date).toLocaleDateString()}</p></div><button onClick={() => handleDelete(exp._id, 'expense')}><Trash2 className="w-4 h-4 text-pran-red" /></button></div>)))}
            {activeTab === 'income' && (incomes.map(inc => (<div key={inc._id} className="p-3 rounded-lg border border-black/10 flex justify-between items-start"><div><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-pran-green/10 text-pran-green">{inc.source}</span><p className="font-semibold text-gray-dark mt-1">RS {inc.amount.toLocaleString()}</p><p className="text-xs text-gray-medium">{new Date(inc.date).toLocaleDateString()}</p></div><button onClick={() => handleDelete(inc._id, 'income')}><Trash2 className="w-4 h-4 text-pran-red" /></button></div>)))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;