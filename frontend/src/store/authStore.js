import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      notifications: [],
      unreadCount: 0,

      setNotifications: (notifications) => {
        set({ 
            notifications,
            unreadCount: notifications.filter(n => !n.isRead).length
        });
      },
      
      addNotification: (notification) => {
        set(state => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
      },
      
      markAllAsRead: () => {
        set(state => ({
            notifications: state.notifications.map(n => ({...n, isRead: true})),
            unreadCount: 0
        }));
      },

      login: async (email, password, role) => {
        try {
          const response = await axiosInstance.post('/api/auth/login', {
            email,
            password,
            role, // The backend doesn't use role for login, but good to have if needed
          });
          const { accessToken, ...userData } = response.data;
          set({ user: userData, accessToken, isAuthenticated: true });
          return userData;
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: async () => {
         try {
          await axiosInstance.post('/api/auth/logout');
        } catch (error) {
          console.error('Logout failed on server:', error);
        } finally {
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      getMe: async () => {
        if (!get().accessToken) return;
        try {
          const response = await axiosInstance.get('/api/auth/me');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          console.error('Failed to fetch user:', error);
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (userData) => set({ user: userData }),
    }),
    
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);