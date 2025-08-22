import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../api/axios';
import { Link } from 'react-router-dom';
import { Bell, Calendar, MessageSquare } from 'lucide-react';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const NotificationsPage = () => {
  const { notifications, setNotifications, markAllAsRead } = useAuthStore();
  const [activeTab, setActiveTab] = useState('All');
  const [filters, setFilters] = useState({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      date: ''
  });

  const handleFilterChange = (e) => {
      setFilters({ ...filters, [e.target.name]: e.target.value, date: '' }); // Clear specific date if month/year changes
  };
  
  const handleDateChange = (e) => {
      setFilters({ ...filters, date: e.target.value });
  };
  
  useEffect(() => {
    const fetchFilteredNotifications = async () => {
        let params = {};
        
        // Calculate precise date range in the browser to be timezone-proof
        if (filters.date) {
            const localDate = new Date(filters.date);
            // Get the start of the day in the user's local timezone
            const startDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
            // Get the end of the day by adding 24 hours and subtracting a millisecond
            const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
            
            // Send the full UTC ISO strings to the backend
            params = { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
        } else {
            params = { month: filters.month, year: filters.year };
        }
        
        try {
            const { data } = await axiosInstance.get('/api/notifications', { params });
            setNotifications(data);
        } catch(error) {
            console.error("Failed to fetch notifications", error);
        }
    };
    fetchFilteredNotifications();
  }, [filters, setNotifications]);

  useEffect(() => {
    // Mark notifications as read when the component mounts
    const markAsRead = async () => {
        try {
            await axiosInstance.post('/api/notifications/mark-read');
            markAllAsRead();
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };
    markAsRead();
  }, [markAllAsRead]);

  const filteredNotifications = notifications.filter(n => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Leave') return n.type === 'leave';
      if (activeTab === 'Messages') return n.type === 'chat';
      return true;
  });

  return (
    <div className="rounded-2xl border border-black/10 bg-white max-w-3xl mx-auto p-5">
      <h2 className="text-xl font-semibold tracking-tight">Notifications</h2>
      
      {/* Filters Section */}
      <div className="mt-4 p-4 rounded-lg bg-gray-light grid grid-cols-1 md:grid-cols-3 gap-3">
        <select name="month" value={filters.month} onChange={handleFilterChange} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select name="year" value={filters.year} onChange={handleFilterChange} className="text-sm rounded-md border-black/10 bg-white px-auto py-2">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <input type="date" name="date" value={filters.date} onChange={handleDateChange} className="text-sm rounded-md border-black/10 bg-white px-auto py-2" />
      </div>

      {/* Tabs Section */}
      <div className="border-b border-black/10 mt-4">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('All')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'All' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>All</button>
          <button onClick={() => setActiveTab('Leave')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Leave' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>Leave</button>
          <button onClick={() => setActiveTab('Messages')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'Messages' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium'}`}>Messages</button>
        </nav>
      </div>

      <div className="space-y-3 mt-4">
        {filteredNotifications.length > 0 ? filteredNotifications.map(n => (
          <Link to={n.link} key={n._id} className={`block p-4 rounded-lg border transition ${n.isRead ? 'border-black/10 bg-white hover:bg-gray-light' : 'border-pran-blue/50 bg-pran-blue/5 hover:bg-pran-blue/10'}`}>
            <div className="flex items-start gap-3">
                {n.type === 'leave' && <Calendar className="w-5 h-5 text-pran-yellow mt-1" />}
                {n.type === 'chat' && <MessageSquare className="w-5 h-5 text-pran-blue mt-1" />}
                <div>
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-gray-medium mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
            </div>
          </Link>
        )) : <p className="text-center py-8 text-gray-medium">No notifications match your filters.</p>}
      </div>
    </div>
  );
};

export default NotificationsPage;