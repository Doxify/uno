const pusher = require('../config/pusher');

module.exports = {
  TRIGGER_GAME_STATE: (gameId, userId, state) => {
    pusher.trigger(`presence-STATE_${gameId}${userId}`, 'GAME_STATE', state);
  }
}