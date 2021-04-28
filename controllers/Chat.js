const pusher = require('../config/pusher');

const Controller = {
  send: (req, res, next) => {
    const { roomId, message } = req.body;
    const channel = `CHAT_${roomId}`;

    // Trigger pusher
    pusher.trigger(channel, 'message', {
      username: req.user.username,
      message: message,
      timestamp: new Date()
    });

    return res.json(200);
  }
};

module.exports = Controller;
