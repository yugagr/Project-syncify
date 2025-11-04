"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = realtime;
function realtime(io) {
    const rooms = {};
    io.on('connection', (socket) => {
        console.log('socket connected', socket.id);
        socket.on('joinRoom', ({ roomId, user }) => {
            socket.join(roomId);
            rooms[roomId] = rooms[roomId] || {};
            rooms[roomId][socket.id] = user;
            io.to(roomId).emit('presence', { users: Object.values(rooms[roomId]) });
        });
        socket.on('leaveRoom', ({ roomId }) => {
            socket.leave(roomId);
            if (rooms[roomId])
                delete rooms[roomId][socket.id];
            io.to(roomId).emit('presence', { users: Object.values(rooms[roomId] || {}) });
        });
        socket.on('chatMessage', ({ projectId, message }) => {
            io.to(projectId).emit('chatMessage', { message, senderSocket: socket.id });
        });
        socket.on('boardChange', ({ projectId, patch }) => {
            io.to(projectId).emit('boardChange', { patch, sender: socket.id });
        });
        socket.on('disconnect', () => {
            for (const roomId of Object.keys(rooms)) {
                if (rooms[roomId] && rooms[roomId][socket.id])
                    delete rooms[roomId][socket.id];
                io.to(roomId).emit('presence', { users: Object.values(rooms[roomId] || {}) });
            }
            console.log('socket disconnected', socket.id);
        });
    });
}
