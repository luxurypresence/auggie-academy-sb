import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(':3001', ':3001') || 'http://localhost:3001';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedLeadId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface UseWebSocketCallbacks {
  onNotificationCreated?: (notification: Notification) => void;
  onNotificationUpdated?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(callbacks: UseWebSocketCallbacks) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated || !token) {
      return;
    }

    // Create socket connection with JWT token
    const socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      callbacks.onConnect?.();
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      callbacks.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    // Notification events
    socket.on('notification:created', (notification) => {
      console.log('Received notification:created', notification);
      callbacks.onNotificationCreated?.(notification);
    });

    socket.on('notification:updated', (notification) => {
      console.log('Received notification:updated', notification);
      callbacks.onNotificationUpdated?.(notification);
    });

    socket.on('notifications:bulk-updated', (data) => {
      console.log('Received notifications:bulk-updated', data);
      // Frontend will refetch notifications
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, callbacks]);

  return socketRef.current;
}
