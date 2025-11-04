import { Server, Socket } from 'socket.io';

interface PresenceMap { [socketId: string]: any }
interface RoomMap { [roomId: string]: PresenceMap }

export default function realtime(io: Server) {
  const rooms: RoomMap = {};

  io.on('connection', (socket: Socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinRoom', ({ roomId, user }: { roomId: string; user: any }) => {
      socket.join(roomId);
      rooms[roomId] = rooms[roomId] || {};
      rooms[roomId][socket.id] = user;
      io.to(roomId).emit('presence', { users: Object.values(rooms[roomId]) });
    });

    socket.on('leaveRoom', ({ roomId }: { roomId: string }) => {
      socket.leave(roomId);
      if (rooms[roomId]) delete rooms[roomId][socket.id];
      io.to(roomId).emit('presence', { users: Object.values(rooms[roomId] || {}) });
    });

    socket.on('chatMessage', ({ projectId, message }: { projectId: string; message: any }) => {
      io.to(projectId).emit('chatMessage', { message, senderSocket: socket.id });
    });

    socket.on('boardChange', ({ projectId, patch }: { projectId: string; patch: any }) => {
      io.to(projectId).emit('boardChange', { patch, sender: socket.id });
    });

    socket.on('disconnect', () => {
      for (const roomId of Object.keys(rooms)) {
        if (rooms[roomId] && rooms[roomId][socket.id]) delete rooms[roomId][socket.id];
        io.to(roomId).emit('presence', { users: Object.values(rooms[roomId] || {}) });
      }
      console.log('socket disconnected', socket.id);
    });
  });
}