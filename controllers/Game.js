const Game = require("../database/Game");
const GameUser = require("../database/GameUser");
const GameDeck = require("../database/GameDeck");
const BaseDeck = require("../database/BaseDeck");

const GameDeckController = require("./GameDeck");

const LobbyEvents = require('../events/lobby');
const GameEvents = require('../events/game');

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

    // Assign player numbers to determine which player goes 1st, 2nd, etc...
    GameUser.assignPlayerNumbers(gameId)
      .then(() => {
        // Create the game deck and deal the cards to each player.
        return GameDeckController.createGameDeck(gameId);
      })
      .then(() => {
        // Determine the current player.
        return Game.determineCurrentPlayer(gameId);
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
  handleMove: (request, response, next) => {
    const userId = request.user.id;
    const gameId = request.params.uuid;
    const cardId = request.body.cardId;
    const moveType = request.body.type;
    if (!userId) return JSON_ERROR(response, "User ID is not provided.");
    if (!gameId) return JSON_ERROR(response, "Game ID not provided.");
    if (!moveType) return JSON_ERROR(response, "Move type not provided.");
    
    switch(moveType) {
      case Game.DRAW_CARD:
        this.drawCard(gameId, userId);
        break;
      case Game.PLAY_CARD:
        // play card function init here
        this.playCard(gameId, userId, cardId);
        break;
    }

    return response.status(200);
  },
  drawCard: (gameId, userId) => {

  },
  playCard: (gameId, userId, cardId) => {
    // validate that user is currentPlayer
    // validate that card is in user's deck
    // validate that card is a legal move
    // update db
    // trigger getGameState
  },
  // Returns the current state of a game based on the user who made the request.
  // The calling user will get their full state and a limited state of all other
  // players.
  getGameState: (gameId, userId) => {
    const state = {
      isGameOver: false,
      isClockwise: false,
      lastPlayedCard: {
        value: undefined,
        color: undefined,
      },
      otherPlayers: {},
      user: {
        isCurrentPlayer: false,
        handLength: 0,
        playerNum: 0,
        cards: []
      }
    };

    // Get the current state of the game.
    Game.get(gameId)
      .then((game) => {
        // if(!game) return JSON_ERROR(response, "Could not get game state.");

        // Update game related state.
        state.isGameOver = !game.active;
        state.isClockwise = game.direction_clockwise;

        // Get the base deck
        BaseDeck.getDeck()
          .then((baseDeck) => {
            // if(!baseDeck) return JSON_ERROR(response, "Could not get base deck state.");

            // Get the game users
            GameUser.getGameUsers(gameId)
              .then((gameUsers) => {
                // if(!gameUsers) return JSON_ERROR(response, "Could not get game user state");

                // Get the game deck
                GameDeck.getGameDeck(gameId)
                  .then((gameDeck) => {
                    // if(!gameDeck) return JSON_ERROR(response, "Could not get game deck state.");
          
                    // Map through game deck and build the state.
                    gameDeck.map((gameDeckCard) => {
                      // Get the base card from the base deck based on the game
                      // deck card.
                      const baseCard = baseDeck.filter(i => i.id == gameDeckCard.card)[0];

                      // Update the last played card.
                      if(gameDeckCard.order === GameDeck.LAST_PLAYED) {
                        state.lastPlayedCard = baseCard;
                      }
            
                      if(gameDeckCard.user !== null) {
                        // Get the game user that this game deck card belongs to. 
                        const gameUser = gameUsers.filter(i => i.user == gameDeckCard.user)[0];

                        // Add card state if the card belongs to the calling user.
                        if(gameDeckCard.user === userId) {
                          state.user.playerNum = gameUser.player_num;
                          state.user.isCurrentPlayer = gameUser.current_player;
                          state.user.handLength += 1;
                          state.user.cards.push(baseCard);
                        
                        } else {
                          // Add limited card state if the card does not belong
                          // to the calling user.
                          if(state.otherPlayers[gameUser.player_num]) {
                            state.otherPlayers[gameUser.player_num].handLength += 1;
                          } else {
                            state.otherPlayers[gameUser.player_num] = { 
                              handLength: 1,
                              isCurrentPlayer: gameUser.current_player,
                              userId: gameUser.user
                            };
                          }
                        }
                      }
                    })
            
                    GameEvents.TRIGGER_GAME_STATE(gameId, userId, state);
                    // return response.status(200);
                  })
              })
          })
      })
      .catch((err) => {
        console.log(err);
        // return response.json({
        //   status: "failure",
        //   message: "Error occurred while getting game state",
        // });
      })
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
