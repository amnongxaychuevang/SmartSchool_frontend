import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocketClient = () => {
  if (!socket) {
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl ? config.public.apiBaseUrl.replace(/\/api$/, '') : 'http://localhost:5000';
    
    socket = io(baseUrl, {
      autoConnect: false,
    });
  }

  const connect = () => {
    if (!socket?.connected) {
      socket?.connect();
    }
  };

  const disconnect = () => {
    if (socket?.connected) {
      socket?.disconnect();
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    socket?.off(event, callback);
  };

  return {
    socket,
    connect,
    disconnect,
    on,
    off,
  };
};
