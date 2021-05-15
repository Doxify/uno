const ActiveRecord = require("./ActiveRecord");
const GameUser = require("./GameUser");
const GameDeck = require("./GameDeck");
const BaseDeck = require("./BaseDeck");

// value: 10 - Skip
// value: 11 - Reverse
// value: 12 - Draw 2
// value: 13 - Wildcard
// value: 14 - Draw 4 Wildcard

class Game extends ActiveRecord {
  static table_name = "Game";
  static fields = ["id", "active", "direction_clockwise"];

  static DRAW_CARD = "-1";
  static PLAY_CARD = "-2";
  static CHOOSE_COLOR = "-3";

  id = undefined;
  active = undefined;
  clockwise = undefined;

  constructor(id, active, clockwise) {
    super();
    this.id = id;
    this.active = active;
    this.clockwise = clockwise;
  }

  get id() {
    return this.id;
  }

  get isActive() {
    return this.active;
  }

  get turnClockwise() {
    return this.clockwise;
  }

  // Get specific game instance
  getById(id) {
    return new Promise((resolve, reject) => {
      Game.findBy("id", id)
        .then((game) => {
          if (!game) {
            return resolve(null);
          }

          this.id = game.id;
          this.active = game.active;
          this.clockwise = game.direction_clockwise;

          return resolve(this);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Saves a game to the database with the values from the instance data fields
  save() {
    return new Promise((resolve, reject) => {
      // Insert new game entry into Game table
      Game.createDefault() // create() returns either null or the newly entered game row
        .then((game) => {
          if (!game) {
            resolve(null);
          }
          // Set this game object's id from the auto incremented id field in the Game table
          this.id = game.id;
          this.active = game.active;
          this.clockwise = game.direction_clockwise;

          resolve(game);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static isCurrentPlayer(gameId, userId) {
    return new Promise((resolve, reject) => {
      GameUser.getGameUsers(gameId)
        .then((gameUsers) => {
          // Get the current player of the game

          const currentPlayer = gameUsers.filter((gameUser) => gameUser.current_player == true)[0];


          if(currentPlayer.user === userId) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    })
  }

  // Determines the current player's turn in a game.
  static determineCurrentPlayer(gameId) {
    return new Promise((resolve, reject) => {
      // Get the game
      Game.get(gameId)
        .then((game) => {
          // Get the last played card to determine if next player is skipped or
          // direction changes.
          GameDeck.getLastPlayedCard(game.id)
            .then((lastPlayedCard) => {
              BaseDeck.getCard(lastPlayedCard.card)
                .then((lastPlayedBaseCard) => {
                  const isClockwise = game.direction_clockwise;
                  const nextPlayerSkipped = lastPlayedBaseCard.value === BaseDeck.SKIP || lastPlayedBaseCard.value === BaseDeck.DRAW2 || lastPlayedBaseCard.value === BaseDeck.WILDDRAW4;
    
                  // Get all of the game users
                  GameUser.getGameUsers(gameId)
                    .then((gameUsers) => {
                      const currentPlayer = gameUsers.filter((i) => i.current_player == true)[0];

                      // If there is no current player, assign one at random.
                      if(!currentPlayer) {
                        console.log("here...");
                        let randomPlayerNum = Math.floor(Math.random() * GameUser.MAX_GAME_USERS_PER_GAME) + 1;
                        let randomPlayer = gameUsers.filter((i) => i.player_num == randomPlayerNum)[0];
                        
                        GameUser.setCurrentPlayer(gameId, randomPlayer.user, true)
                          .then(() => {
                            return resolve(randomPlayer);
                          })
                          .catch((err) => {
                            return reject(err);
                          })
                      
                      } else {
                        // If there is a current player, determine the next player
                        // and update current player status for both players.
                        var promises = [];
                        let nextPlayerNum;
                        let nextPlayer;

                        if(isClockwise) {

                          if(currentPlayer.player_num === GameUser.MAX_GAME_USERS_PER_GAME) {
                            
                            if(nextPlayerSkipped) {
                              nextPlayerNum = 2
                            } else {
                              nextPlayerNum = 1;
                            }

                          } else {

                            if(nextPlayerSkipped) {
                              if(currentPlayer.player_num + 2 > GameUser.MAX_GAME_USERS_PER_GAME) {
                                nextPlayerNum = 1;
                              } else {
                                nextPlayerNum = currentPlayer.player_num + 2;
                              }
                            } else {
                              nextPlayerNum = currentPlayer.player_num + 1;
                            }

                          }

                        } else {

                          if(currentPlayer.player_num === 1) {

                            if(nextPlayerSkipped) {
                              nextPlayerNum = GameUser.MAX_GAME_USERS_PER_GAME - 1;
                            } else {
                              nextPlayerNum = GameUser.MAX_GAME_USERS_PER_GAME;
                            }

                          } else {

                            if(nextPlayerSkipped) {
                              if(currentPlayer.player_num - 2 < 1) {
                                nextPlayerNum = GameUser.MAX_GAME_USERS_PER_GAME;
                              } else {
                                nextPlayerNum = currentPlayer.player_num - 2;
                              }
                            } else {
                              nextPlayerNum = currentPlayer.player_num - 1;
                            }

                          }

                        }

                        // Set the nextPlayer based off the computed nextPlayerNum
                        nextPlayer = gameUsers.filter((i) => i.player_num == nextPlayerNum)[0];
                        
                        // Create promises for updating current and next player.
                        promises.push(
                          GameUser.setCurrentPlayer(gameId, currentPlayer.user, false),
                          GameUser.setCurrentPlayer(gameId, nextPlayer.user, true)
                        );

                        // Execute promises
                        Promise.all(promises)
                          .then(() => {
                            return resolve(nextPlayer);
                          })
                          .catch((err) => {
                            return reject(err);
                          })
                      }
                    })
                    .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  // Get the previous player given the current player's player num
  static getPreviousPlayer(gameId, currentPlayerNum) {
    // Get game

    return new Promise((resolve, reject) => {
      Game.get(gameId)
      .then((game) => {

        // Get all game users in the game
        GameUser.getGameUsers(gameId)
          .then((gameUsers) => {

            let previousPlayerNum = 0;

            if(game.direction_clockwise) {
              previousPlayerNum = (currentPlayerNum === 1) ? 4 : currentPlayerNum - 1;
            } else {
              previousPlayerNum = (currentPlayerNum === GameUser.MAX_GAME_USERS_PER_GAME) ? 1 : currentPlayerNum + 1;
            }
            console.log("Clockwise: " + game.direction_clockwise)
            console.log("Current Player: " + currentPlayerNum)
            console.log("Previous Player: " + previousPlayerNum)


            return resolve(gameUsers.filter((i) => i.player_num === previousPlayerNum)[0]);
          })
          .catch((err) => {
            console.log(err);
            return resolve(null);
          })

      })
      .catch((err) => {
        console.log(err);
        return resolve(null);
      })
    })
  }

  // Get all active games, used for game dashboard
  static getActiveGames() {
    return new Promise((resolve, reject) => {
      Game.findAll("active", true)
        .then((gamesData) => {
          // Iterate over all rows in JSON data
          let games = [];

          for (let gameData of gamesData) {
            // For each row in gamesData, create a new Game Object
            let game = new Game(
              gameData.id,
              gameData.active,
              gameData.direction_clockwise
            );

            games.push(game);
          }
          resolve(games);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Get number of players for specific game
  static getNumOfPlayers(id) {
    return new Promise((resolve, reject) => {
      return resolve(GameUser.getNumberOfPlayers(id));
    });
  }

  // Returns a game by its id.
  static get(id) {
    return new Promise((resolve, reject) => {
      Game.findBy("id", id)
        .then((game) => {
          if (!game) {
            return resolve(null);
          }
          return resolve(game);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = Game;
