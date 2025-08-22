import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, CalendarCheck2, UserPlus, Cloud, Settings, DownloadCloud, Package, CreditCard, MessageSquare, BarChartHorizontal, Target,} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const managerNavLinks = [
  { to: '/manager', icon: LayoutDashboard, text: 'Dashboard' },
  { to: '/manager/targets', icon: Target, text: 'Target Setting' },
  { to: '/leaderboard', icon: BarChartHorizontal, text: 'Leaderboard' },
  { to: '/expenses', icon: CreditCard, text: 'My Expenses' },
  { to: '/manager/team', icon: Users, text: 'All Executives' },
  { to: '/manager/teams', icon: Users, text: 'Manage Teams' },
  { to: '/manager/leaves', icon: CalendarCheck2, text: 'Leave Approvals' },
  //{ to: '/manager/register', icon: UserPlus, text: 'Register Executives' }, // This will be a modal
  { to: '/files', icon: Cloud, text: 'Notices' },
  { to: '/manager/products', icon: Package, text: 'Products' },
  { to: '/manager/reports', icon: DownloadCloud, text: 'Team Sales Report' },

  { to: '/chat', icon: MessageSquare, text: 'Team Chat' },
];

const executiveNavLinks = [
  { to: '/executive', icon: LayoutDashboard, text: 'Dashboard' },
  { to: '/executive/my-targets', icon: Target, text: 'My Targets' },
  { to: '/leaderboard', icon: BarChartHorizontal, text: 'Leaderboard' },
  { to: '/expenses', icon: CreditCard, text: 'My Expenses' },
  { to: '/executive/submit-sale', icon: UserPlus, text: 'Submit Sales' },
  { to: '/executive/my-progress', icon: Cloud, text: 'All Sales' },
  { to: '/executive/leaves', icon: CalendarCheck2, text: 'Request Leave' },
  { to: '/executive/attendance', icon: CalendarDays, text: 'My Attendance' },
  { to: '/files', icon: Cloud, text: 'Notices' },
  { to: '/chat', icon: MessageSquare, text: 'Team Chat' },
];

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  const user = useAuthStore((state) => state.user);
  const navLinks = user?.role === 'MANAGER' ? managerNavLinks : executiveNavLinks;;

  return (
    <aside
      className={`fixed lg:static z-30 inset-y-0 left-0 w-64 transform transition-transform bg-white border-r border-black/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
    >
      <div className="h-16 px-4 flex items-center border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 grid place-items-center rounded-md border border-black/10 text-pran-red font-semibold tracking-tighter">{user?.role === 'MANAGER' ? 'M' : 'E'}</div>
          <div className="font-medium tracking-tight">{user?.role === 'MANAGER' ? 'Manager' : 'Executive'} Section</div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.text}
            to={link.to}
            end // Important for the main Dashboard link to not stay active on child routes
            onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after click
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-pran-red/5 text-pran-red' : 'hover:bg-black/5'
              }`
            }
          >
            <link.icon className="w-4 h-4" strokeWidth={1.5} /> {link.text}
          </NavLink>
        ))}
        <div className="pt-2 border-t border-black/5 mt-2"></div>
        <NavLink
          to="/profile"
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-pran-red/5 text-pran-red' : 'hover:bg-black/5'
            }`
          }
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} /> Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;