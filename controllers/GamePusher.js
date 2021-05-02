const User = require('../database/User');
const GameUser = require('../database/GameUser');
const pusher = require('../config/pusher');

const GamePusherController = {
  // Takes an instance of User and announces that they have joined the Game. 
  TRIGGER_PLAYER_JOINED_LOBBY: (gameId) => {
    GameUser.getGameUsers(gameId)
      .then((gameUsers) => {
        if(gameUsers) {

          // Create all promises to get each GameUser's username.
          var promises = [];
          gameUsers.forEach(gameUser => {
            promises.push(
              User.getUser(gameUser.user)
                .then(user => {
                  gameUser.username = user.username;
                })
            )
          })

          // Execute all promises and trigger pusher.
          Promise.all(promises).then(() => {
            const channel = `LOBBY_${gameId}`;
            const event = 'PLAYER_JOIN';

            pusher.trigger(channel, event, gameUsers);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
};

module.exports = GamePusherController;