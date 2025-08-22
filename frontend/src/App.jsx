import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import axiosInstance from './api/axios';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Shared Authenticated Pages
import ProfilePage from './pages/shared/ProfilePage';
import ExpensesPage from './pages/shared/ExpensesPage';
import ChatPage from './pages-chat/ChatPage';
import LeaderboardPage from './pages/shared/LeaderboardPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import FilesPage from './pages/shared/FilesPage';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamManagementPage from './pages/manager/TeamManagementPage';
import LeaveApprovalsPage from './pages/manager/LeaveApprovalsPage';
import ProductsPage from './pages/manager/ProductsPage';
import ReportsPage from './pages/manager/ReportsPage';
import TeamsPage from './pages/manager/TeamsPage';
import TargetsPage from './pages/manager/TargetsPage';

// Executive Pages
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';
import MyTargetsPage from './pages/executive/MyTargetsPage';
import RequestLeavePage from './pages/executive/RequestLeavePage';
import SubmitSalePage from './pages/executive/SubmitSalePage';
import AttendancePage from './pages/executive/AttendancePage';
import MyProgressPage from './pages/executive/MyProgressPage';


// --- GUARD COMPONENTS ---
const ManagerRoutes = () => {
  const { user } = useAuthStore();
  return user?.role === 'MANAGER' ? <AppLayout /> : <Navigate to="/" replace />;
};

const ExecutiveRoutes = () => {
  const { user } = useAuthStore();
  return user?.role === 'EXECUTIVE' ? <AppLayout /> : <Navigate to="/" replace />;
};

const SharedRoutes = () => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />;
}

const RoleBasedRedirect = () => {
    const { user } = useAuthStore.getState();
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'MANAGER' ? <Navigate to="/manager" replace /> : <Navigate to="/executive" replace />;
}

function App() {
  const { isAuthenticated, getMe, accessToken, setNotifications } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
        if (accessToken) {
            await getMe();
            const { data } = await axiosInstance.get('/api/notifications');
            setNotifications(data);
        }
    }
    initApp();
  }, [accessToken, getMe, setNotifications]);

  return (
    <SocketProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* --- Public Routes --- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={!isAuthenticated ? <HomePage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          </Route>

          {/* --- A dedicated route to handle redirecting logged-in users --- */}
          <Route path="/dashboard" element={<RoleBasedRedirect />} />

          {/* --- Role-Specific Protected Routes --- */}
          <Route element={<ManagerRoutes />}>
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/manager/team" element={<TeamManagementPage />} />
            <Route path="/manager/leaves" element={<LeaveApprovalsPage />} />
            <Route path="/manager/products" element={<ProductsPage />} />
            <Route path="/manager/reports" element={<ReportsPage />} />
            <Route path="/manager/teams" element={<TeamsPage />} />
            <Route path="/manager/targets" element={<TargetsPage />} />
          </Route>
          
          <Route element={<ExecutiveRoutes />}>
            <Route path="/executive" element={<ExecutiveDashboard />} />
            <Route path="/executive/my-targets" element={<MyTargetsPage />} />
            <Route path="/executive/leaves" element={<RequestLeavePage />} />
            <Route path="/executive/submit-sale" element={<SubmitSalePage />} />
            <Route path="/executive/attendance" element={<AttendancePage />} />
            <Route path="/executive/my-progress" element={<MyProgressPage />} />
          </Route>

          {/* --- Shared Protected Routes (Accessible by both roles) --- */}
          <Route element={<SharedRoutes />}>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/files" element={<FilesPage />} />
          </Route>

          {/* --- Catch-all to redirect any unknown URL to the home page --- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;