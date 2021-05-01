const GameUser = require('../database/GameUser');

const Controller = {
  create: (user, game) => {
    // TODO: Validation
    // TODO: Make sure user is valid
    // TODO: Make sure game is valid
    // TODO: Make sure user is not in game already.
    const game_user = new GameUser(user, game);
    return new Promise((resolve, reject) => {
      game_user.save()
      .then((createdGameUser) => {
        if(!createdGameUser) {
          return resolve(null);
        }
        return resolve(createdGameUser);
        // return res.json({
        //   status: 'success',
        //   message: 'Successfully created GameUser',
        //   data: createdGameUser
        // })
      });
    });
  },
  getNumberOfGameUsers: (game) => {
    return new Promise((resolve, reject) => {
    });
  },
  getGameUsers: (game) => {
    return new Promise((resolve, reject) => {
      resolve(GameUser.getGameUsers(game));
    });
  }
};

module.exports = Controller;