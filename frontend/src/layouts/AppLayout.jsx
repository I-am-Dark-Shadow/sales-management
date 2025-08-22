import React, { useState } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import Sidebar from '../components/shared/Sidebar';
import { Bell, LogOut, PanelLeftOpen } from 'lucide-react';
import RealTimeClock from '../components/shared/RealTimeClock';

const AppLayout = () => {
  const { isAuthenticated, user, logout, unreadCount } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex min-h-screen bg-gray-light">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-black/5">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-black/10 hover:bg-black/5 transition"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium tracking-tight">Dashboard</div>
            </div>
            <div className="flex items-center gap-4">
              <RealTimeClock />
              <Link to="/notifications" className="relative w-9 h-9 rounded-md border border-black/10 hover:bg-black/5 grid place-items-center transition">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 &&
                  <span className="absolute -top-1 -right-1 text-[10px] bg-pran-red text-white rounded-full px-1.5 py-0.5">{unreadCount}</span>
                }
              </Link>
              <div className="flex items-center gap-2 border border-black/10 rounded-lg px-2 py-1.5">
                <img
                  src={user.profilePicture?.url || `https://ui-avatars.com/api/?name=${user.name}&background=D32F2F&color=fff&rounded=true&size=32`}
                  className="w-8 h-8 rounded-full object-cover bg-gray-200" // Added bg-gray-200 for better placeholder
                  alt="User profile"
                />
                <div className="hidden sm:block">
                  <div className="text-sm font-medium tracking-tight">{user.name}</div>
                  <div className="text-xs text-gray-medium capitalize">{user.role.toLowerCase()}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1.5 rounded-md hover:bg-black/5 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;