const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // ─── Socket Auth Middleware ───────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId)
        .populate('companyId')
        .populate('departmentId');

      if (!user || !user.isActive) return next(new Error('Invalid or inactive user'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Connected: ${user.name} (${user.role})`);

    // ─── Join Room ──────────────────────────────────────────────────────────
    socket.on('join_room', async ({ groupId }) => {
      try {
        const companyId = user.companyId._id.toString();

        // Validate group exists and belongs to same company
        const group = await Group.findOne({ _id: groupId, companyId });
        if (!group) {
          socket.emit('error', { message: 'Group not found or access denied.' });
          return;
        }

        // Employee: must belong to that group's department
        if (user.role === 'EMPLOYEE') {
          const userDeptId = user.departmentId?._id?.toString();
          if (!userDeptId || group.departmentId.toString() !== userDeptId) {
            socket.emit('error', { message: 'Access denied. You cannot join this room.' });
            console.warn(`⛔ Unauthorized room join attempt by ${user.name} for group ${groupId}`);
            return;
          }
        }

        // Leave previous rooms (except socket's own room)
        for (const room of socket.rooms) {
          if (room !== socket.id) socket.leave(room);
        }

        const roomName = `group:${groupId}`;
        socket.join(roomName);
        socket.currentGroupId = groupId;
        socket.currentRoomName = roomName;

        socket.emit('joined_room', { groupId, groupName: group.name });
        console.log(`✅ ${user.name} joined room: ${roomName}`);
      } catch (err) {
        socket.emit('error', { message: 'Failed to join room.' });
      }
    });

    // ─── Send Message ───────────────────────────────────────────────────────
    socket.on('send_message', async ({ content }) => {
      try {
        if (!socket.currentGroupId) {
          socket.emit('error', { message: 'You must join a room first.' });
          return;
        }

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty.' });
          return;
        }

        if (content.length > 2000) {
          socket.emit('error', { message: 'Message too long (max 2000 chars).' });
          return;
        }

        const companyId = user.companyId._id;
        const groupId = socket.currentGroupId;

        // Re-verify access at message send time (defense in depth)
        const group = await Group.findOne({ _id: groupId, companyId });
        if (!group) {
          socket.emit('error', { message: 'Group not found.' });
          return;
        }

        if (user.role === 'EMPLOYEE') {
          const userDeptId = user.departmentId?._id?.toString();
          if (group.departmentId.toString() !== userDeptId) {
            socket.emit('error', { message: 'Access denied.' });
            return;
          }
        }

        const message = await Message.create({
          content: content.trim(),
          senderId: user._id,
          groupId,
          companyId,
          departmentId: group.departmentId
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name email role avatar');

        // Broadcast to everyone in the room
        io.to(socket.currentRoomName).emit('new_message', { message: populated });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ─── Typing Indicators ──────────────────────────────────────────────────
    socket.on('typing_start', () => {
      if (socket.currentRoomName) {
        socket.to(socket.currentRoomName).emit('user_typing', {
          userId: user._id,
          name: user.name
        });
      }
    });

    socket.on('typing_stop', () => {
      if (socket.currentRoomName) {
        socket.to(socket.currentRoomName).emit('user_stopped_typing', {
          userId: user._id
        });
      }
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
