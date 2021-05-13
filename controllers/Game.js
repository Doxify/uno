const Game = require("../database/Game");
const GameUser = require("../database/GameUser");
const GameDeck = require("../database/GameDeck");
const BaseDeck = require("../database/BaseDeck");

const GameDeckController = require("./GameDeck");

const LobbyEvents = require('../events/lobby');
const GameEvents = require('../events/game');
const GameDeckCard = require("../database/GameDeck");
const game = require("../events/game");

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
        if (totalPlayersInGame && totalPlayersInGame >= GameUser.MAX_GAME_USERS_PER_GAME) {
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
          message: "Error occurred while getting starting GAME_" + gameId,
        });
      });
  },
  handleMove: (request, response, next) => {
    const userId = request.user.id;
    const gameId = request.params.uuid;
    const cardId = request.body.cardId;
    const color = request.body.color;
    const moveType = request.body.type;
    if (!userId) return JSON_ERROR(response, "User ID is not provided.");
    if (!gameId) return JSON_ERROR(response, "Game ID not provided.");
    if (!moveType) return JSON_ERROR(response, "Move type not provided.");

    switch (moveType) {
      case Game.DRAW_CARD:
        GameController.drawCard(gameId, userId, 1);
        break;
      case Game.PLAY_CARD:
        // play card function init here
        if (!cardId) return JSON_ERROR(response, "Card not provided.");
        GameController.playCard(gameId, userId, cardId);
        break;
      case Game.CHOOSE_COLOR:
        console.log("received choose color event");
        if (!color) return JSON_ERROR(response, "Color not provided.");
        GameController.changeGameColor(gameId, userId, color);
        break;
    }
    return response.json({ status: 'success' });
  },
  drawCard: (gameId, userId, amountToDraw = 1) => {
    // Validate that user is in that game and is currentPlayer
    return new Promise((resolve, reject) => {
      GameController.canMakeMove(gameId, userId)
        .then((canMove) => {
          if (!canMove) {
            return resolve(false);
          }
          // Need to get the card at the top of the deck
          GameDeckController.getTopCard(gameId)
            .then((topCard) => {                
                // Update the order and user fields in topCard to simulate the Game User drawing the card
                GameDeck.update(
                  { game: topCard.game, card: topCard.card },
                  { user: userId, order: GameDeck.DRAWN }
                )
                  .then((_) => {
                    // send Game State to all users in game
                    GameController.sendGameState(gameId)
                      .then((_) => {
                        return resolve(true)
                      })
                      .catch((err) => {
                        return resolve(false);
                      })
                  })
                  .catch((err) => {
                    console.log(err);
                    return resolve(false);
                  }); 
            })
            .catch((err) => {
              console.log(err);
              return resolve(false);
            })
        })
    })
  },
  playCard: (gameId, userId, cardId) => {
    return new Promise((resolve, reject) => {
      GameController.canMakeMove(gameId, userId)
        .then((canMove) => {
          if (!canMove) {
            console.log("can't make move")
            return resolve(false);
          }

          GameDeck.getUserHand(gameId, userId)
            .then((userGameHand) => {
              console.log("blah blah blah")
              // Check if the card is in the user's hand.
              let cardPlayedFromHand = userGameHand.filter(i => i.card == cardId)[0];
              if (!cardPlayedFromHand) return resolve(false);

              console.log("blah 10")

              // Validate that the move is legal.
              GameDeck.getLastPlayedCard(gameId)
                .then((lastPlayedCard) => {
                  if (!lastPlayedCard) return resolve(false);

                  // Get the base card of the played card and last played card.
                  BaseDeck.getCard(cardPlayedFromHand.card)
                    .then((basePlayedCard) => {

                      if (!basePlayedCard) return resolve(false);

                      BaseDeck.getCard(lastPlayedCard.card)
                        .then((baseLastPlayedCard) => {
                          if (!baseLastPlayedCard) return resolve(false);
                          if (!GameController.validateMove(basePlayedCard, baseLastPlayedCard, lastPlayedCard)) {
                            return resolve(false);
                          }

                          var promises = [];
                          // Set the order of the last played card to -3.
                          promises.push(
                            GameDeck.update(
                              { game: lastPlayedCard.game, card: lastPlayedCard.card },
                              { order: GameDeck.PLAYED }
                            )
                          );
                          // Set the order of the card being played to one of the LAST_PLAYED constants in GameDeck.
                          // Set the user of the card being played to null.
                          promises.push(
                            GameDeck.update(
                              { game: cardPlayedFromHand.game, card: cardPlayedFromHand.card },
                              { order: GameDeckCard.getLastPlayedCardOrder(basePlayedCard.color), user: null }
                            )
                          );

                          // If the played card is a reverse card, change the
                          // direction of the game.
                          if (basePlayedCard.value === BaseDeck.REVERSE) {
                            promises.push(
                              Game.get(gameId)
                                .then((game) => {
                                  Game.update(
                                    { id: cardPlayedFromHand.game },
                                    { direction_clockwise: !game.direction_clockwise }
                                  )
                                })
                            )
                          }


                          // If the played card is a wild card, need to send another request back to the player that played the wildcard
                          // so that he/she can choose what color to change it to
                          if (basePlayedCard.value === BaseDeck.WILD || basePlayedCard.value === BaseDeck.WILDDRAW4) {

                            // Execute promises which update the state of the game.
                            Promise.all(promises)
                              .then(() => {
                                console.log("got here 4");
                                // Send Pusher Event to only the user that played the WildCard
                                GameEvents.TRIGGER_GAME_COLOR_CHOOSER(gameId, userId);
                              })
                              .catch((err) => {
                                console.log(err);
                                return resolve(false);
                              })

                          } else {

                            // Execute promises which update the state of the game.
                            Promise.all(promises)
                              .then(() => {
                                GameController.updateNextPlayerState(gameId, basePlayedCard)
                                  .then((resolved) => {
                                    return resolve(resolved);
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    return resolve(false);
                                  })
                              })
                              .catch((err) => {
                                console.log(err);
                                return resolve(false);
                              });
                          }
                        })
                        .catch((err) => {
                          console.log(err);
                          return resolve(false);
                        });
                    })
                    .catch((err) => {
                      console.log(err);
                      return resolve(false);
                    });
                })
                .catch((err) => {
                  console.log(err);
                  return resolve(false);
                });
            })
            .catch((err) => {
              console.log(err);
              return resolve(false);
            });
        })
    });
  },
  changeGameColor: (gameId, userId, color) => {
    console.log("got here");
    return new Promise((resolve, reject) => {
      GameController.canMakeMove(gameId, userId)
        .then((canMove) => {
          if (!canMove) {
            console.log("can't make move")
            return resolve(false);
          }
          // Get last played card
          GameDeck.getLastPlayedCard(gameId)
            .then((lastPlayedCard) => {
              if (!lastPlayedCard) return resolve(false);

              // Get the base card of the last played card.

              BaseDeck.getCard(lastPlayedCard.card)
                .then((baseLastPlayedCard) => {

                  // Check to make sure that the last played card is a wildcard
                  if (!baseLastPlayedCard || (baseLastPlayedCard.value != BaseDeck.WILD && baseLastPlayedCard.value != BaseDeck.WILDDRAW4)) return resolve(false);

                  // Update the order of the baseLastPlayedCard to whatever color the user chose
                  GameDeck.update(
                    { game: gameId, card: baseLastPlayedCard.id },
                    { order: GameDeckCard.getLastPlayedCardOrder(color) }
                  )
                    .then((_) => {
                      GameController.updateNextPlayerState(gameId, baseLastPlayedCard);
                    })
                    .catch((err) => {
                      console.log(err);
                      return resolve(false);
                    })

                })
                .catch((err) => {
                  console.log(err);
                  return resolve(false);
                })
            })
            .catch((err) => {
              console.log(err);
              return resolve(false);
            })

        })
        .catch((err) => {
          console.log(err);
          return resolve(false);
        })
    })
  },
  // Helper method that updates the current player, makes the updated current player draw cards if he/she has to, and skips when needed
  updateNextPlayerState: (gameId, basePlayedCard) => {
    return new Promise((resolve, reject) => {
      // Determine the next currentPlayer based on the
      // move that just occurred.
      Game.determineCurrentPlayer(gameId)
        .then((currentPlayer) => {

          var promises = [];

          // If the card played requires the next player
          // to draw cards, handle that here.
          if (basePlayedCard.value === BaseDeck.DRAW2 || basePlayedCard.value === BaseDeck.WILDDRAW4) {
            let numCards = basePlayedCard.value === BaseDeck.DRAW2 ? 2 : 4;

            GameDeckController.getMultipleTopCards(gameId, numCards)
              .then((topCards) => {
                topCards.forEach((topCard, i) => {
                  promises.push(
                    // Update the order and user fields in topCard to simulate the Game User drawing the card
                    GameDeck.update(
                      { game: topCard.game, card: topCard.card },
                      { user: currentPlayer.user, order: GameDeck.DRAWN }
                    )
                  )
                });

                // Execute all draw card promises and send game state.
                Promise.all(promises)
                  .then((_) => {
                    // Send the most recent game state to all users.
                    GameController.sendGameState(gameId)
                      .then((_) => {
                        return resolve(true);
                      })
                      .catch((err) => {
                        console.log(err);
                        return resolve(false);
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    return resolve(false);
                  });
              })
              .catch((err) => {
                console.log(err);
                return resolve(false);
              });

          } else {

            // If no cards are required to be draw, just
            // send the game state.
            GameController.sendGameState(gameId)
              .then((_) => {
                return resolve(true);
              })
              .catch((err) => {
                console.log(err);
                return resolve(false);
              });
          }

        })
        .catch((err) => {
          console.log(err);
          return resolve(false);
        });
    })
  },

  // Sends the individualized game state of all game users in a game
  sendGameState: (gameId) => {
    // Get all game users in game
    return new Promise((resolve, reject) => {
      GameUser.getGameUsers(gameId)
        .then((gameUsers) => {
          var promises = [];

          // Create promise to send individualized game state
          gameUsers.forEach((gameUser) => {
            promises.push(
              GameController.getGameState(gameUser.game, gameUser.user)
            );
          });

          // Execute all promises
          Promise.all(promises)
            .then((_) => {
              return resolve(true);
            })
        })
        .catch((err) => {
          console.log(err);
          return resolve(false);
        })
    })
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


                var promises = [];


                gameUsers.forEach((gameUser) => {
                  promises.push(
                    GameDeck.getUserHand(gameId, gameUser.user)
                      .then((hand) => {

                        if (hand.length == 0) {
                          state.isGameOver = true;

                          promises.push(
                            GameUser.update(
                              { game: gameId, user: gameUser.user },
                              { winner: true }
                            )
                          );
                        }

                        if (gameUser.user === userId) {
                          state.user.handLength = hand.length;
                          state.user.playerNum = gameUser.player_num;
                          state.user.isCurrentPlayer = gameUser.current_player;
                          state.user.userId = gameUser.user;
                          state.user.cards = hand.map((i) => baseDeck[i.card - 1]).sort((a, b) => {
                            if (a.color != b.color) {
                              return (a.color > b.color) ? 1 : -1
                            }
                            return (a.value > b.value) ? 1 : -1;
                          });

                        } else {
                          state.otherPlayers[gameUser.player_num] = {
                            handLength: hand.length,
                            isCurrentPlayer: gameUser.current_player,
                            userId: gameUser.user
                          };
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                      })
                  )
                })

                promises.push(
                  GameDeck.getLastPlayedCard(gameId)
                    .then((lastPlayedCard) => {
                      if (!lastPlayedCard) {
                        state.lastPlayedCard = null;
                        return;
                      }

                      state.lastPlayedCard = baseDeck[lastPlayedCard.card - 1];
                    })
                    .catch((err) => {
                      console.log(err);
                    })
                );

                Promise.all(promises)
                  .then(() => {
                    GameEvents.TRIGGER_GAME_STATE(gameId, userId, state);
                  })




                // // Get the game deck
                // GameDeck.getGameDeck(gameId)
                //   .then((gameDeck) => {
                //     // if(!gameDeck) return JSON_ERROR(response, "Could not get game deck state.");


                //     const gameUser = gameUsers.filter(i => i.user == userId)[0];

                //     state.user.playerNum = gameUser.player_num;
                //     state.user.isCurrentPlayer = gameUser.current_player;
                //     state.user.userId = gameUser.user;



                //     // // Map through game deck and build the state.
                //     // gameDeck.map((gameDeckCard) => {
                //     //   // Get the base card from the base deck based on the game
                //     //   // deck card.
                //     //   const baseCard = baseDeck.filter(i => i.id == gameDeckCard.card)[0];

                //     //   // Update the last played card.
                //     //   if (gameDeckCard.order < -5) {
                //     //     state.lastPlayedCard = baseCard;
                //     //   }

                //     //   if (gameDeckCard.user != null) {
                //     //     // Get the game user that this game deck card belongs to. 
                //     //     const gameUser = gameUsers.filter(i => i.user == gameDeckCard.user)[0];

                //     //     // Add card state if the card belongs to the calling user.
                //     //     if (gameDeckCard.user === userId) {
                //     //       state.user.handLength += 1;
                //     //       state.user.cards.push(baseCard);

                //     //     } else {
                //     //       // Add limited card state if the card does not belong
                //     //       // to the calling user.
                //     //       if (state.otherPlayers[gameUser.player_num]) {
                //     //         state.otherPlayers[gameUser.player_num].handLength += 1;
                //     //       } else {
                //     //         state.otherPlayers[gameUser.player_num] = {
                //     //           handLength: 1,
                //     //           isCurrentPlayer: gameUser.current_player,
                //     //           userId: gameUser.user
                //     //         };
                //     //       }
                //     //     }
                //     //   }
                //     // })
                //     GameEvents.TRIGGER_GAME_STATE(gameId, userId, state);
                //   })
              })
          })
      })
      .catch((err) => {
        console.log(err);
      })
  },
  // Check if the user can make move
  canMakeMove: (gameId, userId) => {
    return new Promise((resolve, reject) => {
      GameUser.isGameUser(userId, gameId)
        .then((isGameUser) => {
          if (!isGameUser) return resolve(false);

          Game.isCurrentPlayer(gameId, userId)
            .then((isCurrentPlayer) => {
              if (!isCurrentPlayer) return resolve(false);

              return resolve(true);
            })
            .catch((err) => {
              console.log(err);
              return resolve(false);
            });
        })
        .catch((err) => {
          console.log(err);
          return resolve(false);
        });
    });
  },
  // Validate that move is legal
  validateMove: (basePlayedCard, baseLastPlayedCard, lastPlayedCard) => {
    // Move is valid iff it matches the color and/or value of the
    // last played card as well as being a WILD card.
    if (basePlayedCard.color != GameDeckCard.getLastPlayedColor(lastPlayedCard.order)
      && basePlayedCard.value != baseLastPlayedCard.value
      && basePlayedCard.value != BaseDeck.WILDDRAW4
      && basePlayedCard.value != BaseDeck.WILD) {
      console.log("BasePlayed: ");
      console.log(basePlayedCard)
      console.log("BaseLastPlayed: ")
      console.log(baseLastPlayedCard)
      return false;
    }
    return true;
  },
  // Check if a game exists in the database
  gameExists: (gameId) => {
    let game = new Game()
    return new Promise((resolve, reject) => {
      game.getById(gameId)
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
          if (isGameUser) {
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
