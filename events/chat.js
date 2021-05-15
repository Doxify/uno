const pusher = require('../config/pusher');

module.exports = {
  // Broadcasts a message to a room.
  TRIGGER_MESSAGE_SENT: (username, message, roomId) => {
    const channel = `CHAT_${roomId}`;
    const timestamp = new Date();

    // Trigger pusher
    pusher.trigger(channel, 'message', {
      username: username,
      message: message,
      timestamp: `${timestamp.getHours()}:${timestamp.getMinutes()}`
    });
  }
};