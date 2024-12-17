import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId: socketId
const activeConversations = {}; // conversationId: [userId]

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId != "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Mark Messages as Seen and Notify Other Users
  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );

      // Add user to active conversations
      if (!activeConversations[conversationId]) {
        activeConversations[conversationId] = [];
      }
      if (!activeConversations[conversationId].includes(userId)) {
        activeConversations[conversationId].push(userId);
      }

      // Notify participants about activity
      io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
      io.emit("activeConversationUpdated", {
        conversationId,
        activeUsers: activeConversations[conversationId],
      });
    } catch (error) {
      console.log(error);
    }
  });

  // Leave Conversation on Disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected", userId, socket.id);
    delete userSocketMap[userId];

    // Remove user from active conversations
    for (const conversationId in activeConversations) {
      activeConversations[conversationId] = activeConversations[
        conversationId
      ].filter((id) => id !== userId);

      if (activeConversations[conversationId].length === 0) {
        delete activeConversations[conversationId];
      } else {
        io.emit("activeConversationUpdated", {
          conversationId,
          activeUsers: activeConversations[conversationId],
        });
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Mark user as typing in a conversation
  socket.on("userTyping", ({ conversationId, userId }) => {
    socket.broadcast.emit("typingStatus", { conversationId, userId });
  });

  // Mark user as stopped typing
  socket.on("userStoppedTyping", ({ conversationId, userId }) => {
    socket.broadcast.emit("stoppedTypingStatus", { conversationId, userId });
  });
});

export { io, server, app };
