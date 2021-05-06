const Game = require('../database/Game');
const GameUser = require('../database/GameUser');
const pusher = require('../config/pusher');

module.exports = {
  TRIGGER_GAME_START: (gameId) => {
    pusher.trigger(`presence-LOBBY_${gameId}`, "GAME_START", {
      gameStart: true,
      gameId: gameId,
    });
  }
};