import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Where socket.io lives: the API server. Taken from the configured API URL
 * (http://localhost:5000/api in dev -> http://localhost:5000); a relative API URL
 * means the same origin as the page (behind nginx in production).
 * Every socket in the app must use this, not window.location.origin, which in dev
 * is the Nuxt server and has no socket.io endpoint.
 */
export function socketBaseUrl(): string {
  const api = (tryUseNuxtApp()?.$config.public.apiBaseUrl as string | undefined) || '';
  if (/^https?:\/\//.test(api)) return api.replace(/\/api\/?$/, '');
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export const useSocketClient = () => {
  if (!socket) {
    socket = io(socketBaseUrl(), {
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
