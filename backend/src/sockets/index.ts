import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

let io: Server;

export const initializeSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
        role: string;
      };
      
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);
    
    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      
      // Join admin room for admin users
      if (socket.userRole === 'admin') {
        socket.join('admin');
        console.log(`Admin ${socket.userId} joined admin room`);
      }
    }
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Emit notification to specific user
export const emitToUser = (userId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to all admins
export const emitToAdmins = (event: string, data: unknown): void => {
  if (io) {
    io.to('admin').emit(event, data);
  }
};

// Emit events
export const socketEvents = {
  notificationNew: (userId: string, notification: unknown) => {
    emitToUser(userId, 'notification:new', notification);
  },
  
  orderStatusChanged: (userId: string, order: unknown) => {
    emitToUser(userId, 'order:statusChanged', order);
  },
  
  lowStockAlert: (sweet: unknown) => {
    emitToAdmins('inventory:lowStock', sweet);
  },
  
  newOrder: (order: unknown) => {
    emitToAdmins('order:new', order);
  },
};
