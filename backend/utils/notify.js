import Notification from "../models/Notification.js";

/**
 * Creates a notification in the DB and emits it in real time via Socket.io
 * to the room named after the user's ID (see server.js socket setup).
 */
export const notifyUser = async (io, { userId, title, message, type = "general", relatedOrder }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedOrder,
  });

  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }

  return notification;
};
