const ActiveRecord = require('./ActiveRecord');

class Game extends ActiveRecord {
    static table_name = "Game";
    static fields = ['id', 'active', 'direction_clockwise'];

    #id = undefined;
    #active = undefined;
    #clockwise= undefined;

    constructor(id, active, clockwise) {
        super();
        this.#id = id;
        this.#active = active;
        this.#clockwise = clockwise;
    }

    get id() {
        return this.#id;
    }

    get isActive() {
        return this.#active;
    }

    get turnClockwise() {
        return this.#clockwise;
    }

    // Get all active games, used for game dashboard
    static getAllActiveGames() {
        return new Promise((resolve, reject) => {
            Game.findAll('active', true)
                .then((gamesData) => {
                    // Iterate over all rows in JSON data                                        
                    let games = [];

                    for(let gameData of gamesData) {
                        // For each row in gamesData, create a new Game Object
                        let game = new Game(gameData.id, gameData.active, gameData.direction_clockwise);

                        games.push(game);
                    }
                    resolve(games);
                });
        })
    }


    // Get specific game instance
    getById(id) {
        return new Promise((resolve, reject) => {
            Game.findBy('id', id)
                .then((game) => {
                    if(!game) {
                        resolve(null)
                    }
                    return resolve(game);
                }).catch((err) => {reject(err);})
        });
    }

    
    // Saves a game to the database with the values from the instance data fields
    save() {
        // All columns have default values, so data should be empty
        const data = {}


        // TODO: Validate data before attempting to insert into database.
        
        return new Promise((resolve, reject) => {
            // Insert new game entry into Game table
            Game.createDefault()// create() returns either null or the newly entered game row
                .then((game) => {
                    if(!game) {
                        resolve(null);
                    }
                    // Set this game object's id from the auto incremented id field in the Game table
                    this.#id = game.id;
                    this.#active = game.active;
                    this.#clockwise = game.direction_clockwise;

                    resolve(game);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}

module.exports = Game;