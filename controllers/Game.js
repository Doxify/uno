const Game = require("../database/Game");
const GameUser = require("../database/GameUser");
const GameDeckController = require("./GameDeck");
const GamePusherController = require('./GamePusher');

const GENERIC_ERROR = function (response) {
  return response.json({
    status: "failure",
    message: "An error occurred in the Game Controller.",
  });
};

const JSON_ERROR = function(response, message) {
  return response.json({
    status: 'failure',
    message: message
  })
}

const GameController = {
  create: (request, response, next) => {
    // Create a new game and save it to the database.
    new Game()
      .save()
      .then((createdGame) => {
        if (!createdGame) return GENERIC_ERROR(res);
        // Create the game user.
        return response.json({
          status: "success",
          message: "Successfully created a new game",
          id: createdGame.id,
        });
      })
      .catch((err) => {
        console.log(err);
        return response.json({
          status: "failure",
          message: "Error occurred while creating game.",
        });
      });
  },
  join: (request, response, next) => {
    const user = request.user;
    const gameId = request.params.uuid;
    if (!user) return JSON_ERROR(response, "User is not provided.");
    if (!gameId) return JSON_ERROR(response, "Game ID not provided.");

    // Check if the user is already in the game.
    GameUser.isGameUser(user.id, gameId)
      .then((isGameUser) => {
        if (isGameUser) {
          return JSON_ERROR(response, "User is already a Game User.");
        }

        // Create a new game user and save it to the database.
        new GameUser(user.id, gameId)
          .save()
          .then((createdGameUser) => {
            if (!createdGameUser) {
              return JSON_ERROR(response, "Could not create a new game user.");
            }

            return response.json({
              status: 'success',
              message: 'Successfully created a new game user.'
            })
          })
      })
      .catch((err) => {
        console.log(err);
        return response.json({
          status: "failure",
          message: "Error occurred while joining game.",
        });
      });
  },
  getList: (request, response, next) => {
    const user = request.user;
    if (!user) return JSON_ERROR(response, "User is not provided.");

    Game.getActiveGames()
      .then((activeGames) => {
        // For each game, need to get the number of players
        var promises = [];

        activeGames.forEach((game) => {

          // Add get number of players promise to promises[]
          promises.push(
            Game.getNumOfPlayers(game.id)
              .then((numPlayers) => {
                game.numPlayers = numPlayers;

                // Check if the user is in the game.
                return GameUser.isGameUser(user.id, game.id)
              })
              .then((isGameUser) => {
                game.isGameUser = isGameUser;
                return game;
              })
              .catch((err) => {
                console.log(err);

                return response.json({
                  status: "failure",
                  message:
                    "Error occurred while getting number of players for each game.",
                });
              })
          );
        });

        Promise.all(promises).then(() => {
          return response.json({
            status: 'success',
            games: activeGames
          });
        });

      })
      .catch((err) => {
        console.log(err);
        return response.json({
          status: "failure",
          message: "Error occurred while getting open games.",
        });
      });

  },
  startGame: (game) => {
    // Create new Game Deck in database
    GameDeckController.createGameDeck(game);
  },
};

module.exports = GameController;
