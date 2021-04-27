const GameUser = require('../database/GameUser');

const Controller = {
  create: (req, res, next) => {
    // TODO: Validation
    // TODO: Make sure user_id is valid
    // TODO: Make sure game_id is valid
    // TODO: Make sure user is not in game already.
    const game_user = new GameUser(req.user.id, req.params.game_id);
    game_user.save()
      .then((createdGameUser) => {
        if(!createdGameUser) {
          return res.json({
            status: 'failure',
            message: 'Error occurred while creating GameUser.'
          })
        }

        return res.json({
          status: 'success',
          message: 'Successfully created GameUser',
          data: createdGameUser
        })
      })
  }
};

module.exports = Controller;