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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- socket.io handlers are typed per event by the caller
  const on = (event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see on()
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
