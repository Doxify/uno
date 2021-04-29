const GameUser = require('../database/GameUser');

const Controller = {
  create: (user_id, game_id) => {
    // TODO: Validation
    // TODO: Make sure user_id is valid
    // TODO: Make sure game_id is valid
    // TODO: Make sure user is not in game already.
    const game_user = new GameUser(user_id, game_id);
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
  }
};

module.exports = Controller;