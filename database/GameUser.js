const ActiveRecord = require("./ActiveRecord");

class GameUser extends ActiveRecord {
  static table_name = "Game User";
  static fields = [
    "user",
    "game",
    "player_num",
    "current_player",
    "winner",
  ];

  static MAX_GAME_USERS_PER_GAME = 4;

  user = undefined;
  game = undefined;
  player_num = undefined;
  current_player = undefined;
  winner = undefined;

  constructor(user, game) {
    super();
    this.user = user;
    this.game = game;
  }

  get user() {
    return this.user;
  }

  get game() {
    return this.game;
  }

  get player_num() {
    return this.player_num;
  }

  get isCurrentPlayer() {
    return this.current_player;
  }

  get isWinner() {
    return this.winner;
  }

  set current_player(x) {
    if (!(x instanceof Number)) {
      throw new Error("current_player must be a number.");
    }
    this.current_player = x;
    // TODO: Save to db.
  }

  set winner(x) {
    if (!(x instanceof Boolean)) {
      throw new Error("winner must be a boolean.");
    }
    this.winner = x;
    // TODO: Save to db.
  }

  // Saves a gameUser to the database with the values from instance data fields.
  save() {
    const data = {
      game: this.game,
      user: this.user,
      player_num: null,
      current_player: false,
      winner: false
    };

    return new Promise((resolve, reject) => {
      // Check if there are any available spots.
      GameUser.getGameUsers(this.game)
        .then((gameUsers) => {
          if (!gameUsers || gameUsers.length >= this.MAX_GAME_USERS_PER_GAME) {
            return reject(null);
          }

          // Creating the GameUser
          GameUser.create(data)
            .then((gameUser) => {
              if (!gameUser) {
                return resolve(null);
              }
              return resolve(this);
            })
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  // Get all Game Users in a game
  static getGameUsers(game) {
    return new Promise((resolve, reject) => {
      this.findAll("game", game)
        .then((gameUsers) => {
          if (!gameUsers) { resolve(null); }
          resolve(gameUsers);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        })
    });
  }

  // Returns the GameUser of a game with a specific playerNum
  static getGameUserByPlayerNum(gameId, playerNum) {
    return new Promise((resolve, reject) => {
      if(playerNum < 0 || playerNum > this.MAX_GAME_USERS_PER_GAME) {
        return reject(null);
      }

      this.getGameUsers(gameId)
        .then((gameUsers) => {
          let user = gameUsers.filter((i) => i.player_num === playerNum)[0];
          return resolve(user);
        })
        .catch((err) => {
          return reject(err);
        })
    })
  }

  // Assigns player numbers to a game which has the max number of users.
  static assignPlayerNumbers(game) {
    return new Promise((resolve, reject) => {
      // Get all game users and update their player_num.
      GameUser.getGameUsers(game)
        .then((gameUsers) => {
          // Game is not full or cannot get the number of players.
          if(!gameUsers || gameUsers.length != this.MAX_GAME_USERS_PER_GAME) {
            return reject(null);
          }

          // Create a promise for updating each GameUser's
          // player_num individually.
          var promises = [];
          gameUsers.forEach((gameUser, index) => {
            promises.push(
              GameUser.update(
                { user: gameUser.user, game: gameUser.game }, 
                { player_num: index+1 }
              )
            )
          });

          // Execute all promises.
          Promise.all(promises).then(() => {
            return resolve();
          })
        })
        .catch((err) => {
          return reject(err);
        });
    })
  }

  // Method to get the number of players in a given game
  static getNumberOfPlayers(game) {
    return new Promise((resolve, reject) => {
      this.findAll("game", game)
        .then((gameUsers) => {
          // No game users exist in game
          if(!gameUsers) return resolve(0);

          // At least 1 game user exists so return the length of the returned array
          return resolve(gameUsers.length)
        })
    })
  }


  // Returns whether a relation between a user and game exists.
  static isGameUser(user, game) {
    return new Promise((resolve, reject) => {
      this.findAll("game", game)
        .then((gameUsers) => {
          if (gameUsers.length === 0) { 
            return resolve(false); 
          }

          gameUsers.map(gameUser => {
            if(gameUser.user === user) { 
              return resolve(true); 
            };
          });

          return resolve(false);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

}

module.exports = GameUser;
