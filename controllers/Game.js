const { response } = require("express");
const Game = require("../database/Game");
const GameUser = require("../database/GameUser");
const GameDeckController = require("./GameDeck");
const Pusher = require('../config/pusher');
const LobbyPusher = require('../events/lobby');

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

    console.log("called join game in Game Controller");

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

            // Get the new number of game users in game
            GameUser.getNumberOfPlayers(gameId)
              .then((numGameUsers) => {

                if(numGameUsers < 4) {
                  return response.json({
                    status: 'success',
                    message: 'Successfully created a new game user.'
                  })
                }
                
                // Game has 4 players, that means all users in lobby have successfully joined
                // Start game and create game deck and trigger game start pusher
                // event

                // Assign player numbers
                GameUser.assignPlayerNumbers(gameId)
                  .then(() => {
                    // Start the game
                    GameController.startGame(gameId)
                  })
                  .then((_) => {
                    // Game successfully started, send trigger pusher event
                    LobbyPusher.TRIGGER_GAME_START(gameId);
                  })
              })
          })
          .catch((err) => {
            console.log(err);
            return response.json({
              status: 'failure',
              message: 'Error occurred while creating new game user.'
            });
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
        var lobbyState = undefined;

        // Get the state of all lobbies.
        Pusher.get({ path: '/channels', params: { info: 'user_count,subscription_count', filter_by_prefix: 'presence-LOBBY_' }})
          .then((response) => response.json())
          .then((data) => {
            lobbyState = data.channels;
          })
          .then(() => {
            // Get information relavant to the calling user about each game.
            activeGames.forEach((game) => {
              promises.push(
                // Get the number of game users.
                Game.getNumOfPlayers(game.id)
                  .then((numPlayers) => {
                    game.numPlayers = numPlayers;
    
                    // Get the number of users in the game's lobby if the game
                    // has not started.
                    if(game.numPlayers != GameUser.MAX_GAME_USERS_PER_GAME) {
                      const lobbyChannelName = `presence-LOBBY_${game.id}`;
                      if(lobbyState[lobbyChannelName]) {
                        game.numPlayersInLobby = lobbyState[lobbyChannelName].user_count;
                      } else {
                        game.numPlayersInLobby = 0
                      }
                    }

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
    console.log("starting game");
    return GameDeckController.createGameDeck(game)
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
