const pusher = require('../config/pusher');

const Controller = {
  send: (req, res, next) => {
    const { id, message } = req.body;
    const channel = `CHAT_${id}`;
    const timestamp = new Date();

    // Trigger pusher
    pusher.trigger(channel, 'message', {
      username: req.user.username,
      message: message,
      timestamp: `${timestamp.getHours()}:${timestamp.getMinutes()}`
    });

    return res.json(200);
  }
};

module.exports = Controller;
