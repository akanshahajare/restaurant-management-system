import { io } from 'socket.io-client';

const getSocketUrl = () => {
  return (
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    window.location.origin
  );
};

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    console.warn('Socket connection skipped: no token available');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(getSocketUrl(), {
    auth: {
      token,
    },
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAdminRoom = () => {
  if (socket) {
    socket.emit('joinAdmin');
  }
};

export const joinTableRoom = (tableNumber) => {
  if (socket) {
    socket.emit('joinTable', tableNumber);
  }
};

export const leaveTableRoom = (tableNumber) => {
  if (socket) {
    socket.emit('leaveTable', tableNumber);
  }
};