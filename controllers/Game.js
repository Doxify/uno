const Game = require("../database/Game");
const GameUser = require("../database/GameUser");
const GameDeckController = require("./GameDeck");
const LobbyEvents = require('../events/lobby');

const GENERIC_ERROR = function (response) {
  return response.json({
    status: "failure",
    message: "An error occurred in the Game Controller.",
  });
};

const JSON_ERROR = function (response, message) {
  return response.json({
    status: 'failure',
    message: message
  })
}

const GameController = {
  // Create a new game and save it to the database.
  create: (request, response, next) => {
    new Game().save()
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
        return new GameUser(user.id, gameId).save()
      })
      .then((createdGameUser) => {
        if (!createdGameUser) {
          return JSON_ERROR(response, "Could not create a new game user.");
        }

        // Get the total number of players in the game to determine if the game
        // should start.
        return Game.getNumOfPlayers(gameId)
      })
      .then((totalPlayersInGame) => {
        if(totalPlayersInGame && totalPlayersInGame >= GameUser.MAX_GAME_USERS_PER_GAME) {
          // If there are enough GameUsers, start the game.
          return GameController.start(request, response, next);
        }

        return response.json({
          status: 'success',
          message: 'Successfully created a new game user.'
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

        // Get information relavant to the calling user about each game.
        activeGames.forEach((game) => {
          promises.push(
            // Get the number of game users.
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
  start: (request, response, next) => {
    const gameId = request.params.uuid;
    console.log("called start game: " + gameId);

    // Assign player numbers to determine which player goes 1st, 2nd, etc...
    GameUser.assignPlayerNumbers(gameId)
      .then(() => {
        // Create the game deck and deal the cards to each player.
        return GameDeckController.createGameDeck(gameId);
      })
      .then(() => {
        // Game successfully started, send trigger pusher event
        LobbyEvents.TRIGGER_GAME_START(gameId);
        return response.status(200);
      })
      .catch((err) => {
        console.log(err);
        return response.json({
          status: "failure",
          message: "Error occurred while getting starting GAME_"+gameId,
        });
      });
  },
  updateGameState: (game) => {

  },
  getGameState: (game) => {

  //   var data = {
  //     isGameOver: false,
  //     otherPlayers: [
  //         {
  //             handLength: 7,
  //             playerNum: 4,
  //         },
  //         {
  //             handLength: 7,
  //             playerNum: 1,
  //         },
  //         {
  //             handLength: 7,
  //             playerNum: 2,
  //         },
  //     ],
  //     user: {
  //         cards: [
  //             {
  //                 value: 2,
  //                 color: "Red",
  //             },
  //             {
  //                 value: 3,
  //                 color: "Green",
  //             },
  //             {
  //                 value: 2,
  //                 color: "Blue",
  //             },

  //         ],
  //         handLength: 7,
  //         playerNum: 3,
  //     },
  //     lastPlayedCard: {
  //         value: 6,
  //         color: "Yellow",
  //     }
  // }
    const state = {
      isGameOver: false,
      otherPlayers: [],
      user: {

      }
    }
  },
  // Check if a game exists in the database
  gameExists: (game_id) => {
    game = new Game()
    return new Promise((resolve, reject) => {
      game.getById(game_id)
        .then((game) => {
          if (!game) {
            return resolve(false);
          }

          return resolve(true);
        })
        .catch((err) => {
          console.log(err);
          return response.json({
            status: "failure",
            message: "Error occurred while checking if game exists",
          });
        })
    })
  },
  // Check if a user is a game user in the specific game in the database
  isGameUser: (user, game) => {

    return new Promise((resolve, reject) => {
      GameUser.isGameUser(user, game)
      .then((isGameUser) => {
        if(isGameUser) {
          return resolve(true);
        }

        return resolve(false);
      })
      .catch((err) => {
        console.log(err);
        return response.json({
          status: "failure",
          message: "Error occurred while checking if user is a game user."
        })
      })
    })
  }
};

module.exports = GameController;
