const ActiveRecord = require("./ActiveRecord");

class GameUser extends ActiveRecord {
  static table_name = "Game User";
  static fields = [
    "user_id",
    "game_id",
    "player_num",
    "current_player",
    "winner",
  ];

  static MAX_GAME_USERS_PER_GAME = 4;

  user_id = undefined;
  game_id = undefined;
  player_num = undefined;
  current_player = undefined;
  winner = undefined;

  constructor(user_id, game_id) {
    super();
    this.user_id = user_id;
    this.game_id = game_id;
  }

  get user_id() {
    return this.user_id;
  }

  get game_id() {
    return this.game_id;
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
      game_id: this.game_id,
      user_id: this.user_id,
      player_num: undefined,
      current_player: false,
      winner: false
    };

    return new Promise((resolve, reject) => {
      // Check if there are any available spots.
      GameUser.getNextAvailablePlayerNum(this.game_id)
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
  // game_id. 
  static getNextAvailablePlayerNum(game_id) {
    return new Promise((resolve, reject) => {
      this.findAllBy("game_id", game_id)
        .then((gameUsers) => {
          // No game users exist.
          if (gameUsers.length === 0) { 
            return resolve(1); 
          }

          // Game is full.
          if (gameUsers.length === MAX_GAME_USERS_PER_GAME) {
            return resolve(null);
          }

          return resolve(gameUsers.length + 1);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  // Returns whether a relation between a user_id and game_id exists.
  static isGameUser(user_id, game_id) {
    return new Promise((resolve, reject) => {
      this.findAllBy("game_id", game_id)
        .then((gameUsers) => {
          if (gameUsers.length === 0) { 
            return resolve(false); 
          }

          gameUsers.map(gameUser => {
            if(gameUser.user_id === user_id) { 
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
