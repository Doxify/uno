const User = require('../database/User');
const GameUser = require('../database/GameUser');
const pusher = require('../config/pusher');

module.exports = {
  TRIGGER_GAME_START: (gameId) => {
    pusher.trigger('presence-LOBBY_what', "GAME_START", () => {
      
    })
  }
};