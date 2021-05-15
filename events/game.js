const pusher = require('../config/pusher');

module.exports = {
  TRIGGER_GAME_STATE: (gameId, userId, state) => {
    pusher.trigger(`presence-STATE_${gameId}${userId}`, 'GAME_STATE', state);
  },
  TRIGGER_GAME_COLOR_CHOOSER: (gameId, userId) => {
    console.log("Sending color chooser state");
    pusher.trigger(`presence-STATE_${gameId}${userId}`, 'GAME_COLOR_CHOOSER', {
      activateColorChooser: true,
      gameId: gameId
    });
  }
}