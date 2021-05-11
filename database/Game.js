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
                  const directionChanged = lastPlayedBaseCard.value === BaseDeck.REVERSE;
                  const nextPlayerSkipped = lastPlayedBaseCard.value === BaseDeck.SKIP;
    
                  // Get all of the game users
                  GameUser.getGameUsers(gameId).then((gameUsers) => {
    
                    var promises = [];
                    const currentPlayer = gameUsers.filter((i) => i.current_player == true)[0];
                    let nextPlayer;
    
                    // If the current player num is undefined, assign
                    // one randomly.
                    if (!currentPlayer) {
                      let randomPlayer = Math.floor(Math.random() * 4) + 1;
                      nextPlayer = gameUsers.filter((i) => i.player_num == randomPlayer)[0];
                    } else {
                      // Determine who the current player should be based off
                      // the direction the game is currently going in.
                      if (isClockwise && !directionChanged) {
                        // 'increase' the player num
                        // if (currentPlayer.player_num == GameUser.MAX_GAME_USERS_PER_GAME) {
                        //   nextPlayer = gameUsers.filter((i) => i.player_num == 1)[0];
                        // } else {
                        //   nextPlayer = gameUsers.filter((i) => currentPlayer.player_num + 1 == i.player_num)[0];
                        // }
                        if (currentPlayer.player_num == GameUser.MAX_GAME_USERS_PER_GAME) {
                          nextPlayer = gameUsers.filter(
                            (i) => i.player_num == (nextPlayerSkipped ? 2 : 1)
                          )[0];
                        } else {
                          nextPlayer = gameUsers.filter(
                            (i) => i.player_num == (
                              nextPlayerSkipped ? (((currentPlayer.player_num + 2) > GameUser.MAX_GAME_USERS_PER_GAME) ? 1 : currentPlayer.player_num + 2) 
                              : currentPlayer.player_num + 1
                          ))[0];
                        }
                      } else {
                        // 'decrease' the player num
                        // if (currentPlayer.player_num == 1) {
                        //   nextPlayer = gameUsers.filter((i) => i.player_num == 4)[0];
                        // } else {
                        //   nextPlayer = gameUsers.filter((i) => i.player_num == (currentPlayer.player_num - 1))[0];
                        // }
                        if (currentPlayer.player_num == 1) {
                          nextPlayer = gameUsers.filter(
                            (i) => i.player_num == (nextPlayerSkipped ? 3 : 4)
                          )[0];
                        } else {
                          nextPlayer = gameUsers.filter(
                            (i) => i.player_num == (
                              nextPlayerSkipped ? (((currentPlayer.player_num - 2) < 0) ? 4 : currentPlayer.player_num - 2)
                              : currentPlayer.player_num - 1
                          ))[0];
                        }
                      }
    
    
                      // Create a promise to remove current_player
                      // status from the current player.
                      promises.push(
                        GameUser.update(
                          { user: currentPlayer.user, game: currentPlayer.game },
                          { current_player: false }
                        )
                      );
                    }
    
                    // Create a promise to add current_player status to
                    // the next player.
                    promises.push(
                      GameUser.update(
                        { user: nextPlayer.user, game: nextPlayer.game },
                        { current_player: true }
                      )
                    );
    
                    // Execute all promises
                    Promise.all(promises).then(() => {
                      resolve(true);
                    });

                  });
                })
            })
        })
        .catch((err) => reject(err));
    });
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
