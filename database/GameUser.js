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
      player_num: undefined,
      current_player: false,
      winner: false
    };

    return new Promise((resolve, reject) => {
      // Check if there are any available spots.
      GameUser.getNextAvailablePlayerNum(this.game)
        .then((nextAvailablePlayerNum) => {
          if(!nextAvailablePlayerNum) { 
            return reject(null);
          }

          // Set the player_num
          this.player_num = nextAvailablePlayerNum;
          data.player_num = nextAvailablePlayerNum;

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

  // Helper method to get the next available GameUser player_num for a given
  // game. 
  static getNextAvailablePlayerNum(game) {
    return new Promise((resolve, reject) => {
      this.findAll("game", game)
        .then((gameUsers) => {
          // No game users exist.
          if (gameUsers.length === 0) { 
            return resolve(1); 
          }

          // Game is full.
          if (gameUsers.length === this.MAX_GAME_USERS_PER_GAME) {
            return resolve(null);
          }

          return resolve(gameUsers.length + 1);
        })
        .catch((err) => {
          return reject(err);
        });
    });
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
