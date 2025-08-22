import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { accessToken, addNotification } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: { token: accessToken },
      });
      setSocket(newSocket);
      
      newSocket.on('notification', (data) => {
          toast.success(data.message, { icon: '🔔' });
          addNotification(data);
      });

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [accessToken, addNotification]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};