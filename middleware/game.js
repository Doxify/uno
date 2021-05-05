const GameController = require("../controllers/Game");
const Game = require('../database/Game');
const GameUser = require("../database/GameUser");

module.exports = {
    // Allows a request to go through if the game exists in the database
    gameExists: (request, response, next) => {
        // Get game id
        game = request.params.uuid;

        // Validate that game is the correct UUIDv4 Format
        uuidRegex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

        if(!uuidRegex.test(game)) {
            return response.render('404', { 
                message: "That game id does not exist." 
            })
        }


        GameController.gameExists(game)
            .then((gameExists) => {
                if(gameExists) {
                    next();
                } else {
                    return response.render('404', { 
                        message: "That game id does not exist." 
                    })
                }
            })
    },
    // Allows a requst to go through only if a game is active.
    isActiveGame: (request, response, next) => {
        // Get the game id
        gameId = request.params.uuid;

        // TODO: Handle this differently?
        // Check if the max number of players are in game.
        Game.getNumOfPlayers(gameId)
            .then((playersInGame) => {
                if(playersInGame == GameUser.MAX_GAME_USERS_PER_GAME) {
                    next();
                } else {
                    return response.redirect(`/game/lobby/${gameId}`);
                }

            })
    },
    // Allows a request to go through only if a game is NOT active.
    isNotActiveGame: (request, response, next) => {
        // Get the game id
        gameId = request.params.uuid;

        // TODO: Handle this differently?
        // Check if the max number of players are in game.
        Game.getNumOfPlayers(gameId)
            .then((playersInGame) => {
                if(playersInGame < GameUser.MAX_GAME_USERS_PER_GAME) {
                    next();
                } else {
                    return response.redirect(`/dashboard`);
                }

            })
    },
    // Allows a request to go through if the user is a game user in the specific requested game
    isGameUser: (request, response, next) => {
        // Get user and game id
        user = request.user.id;
        game = request.params.uuid;

        GameController.isGameUser(user, game)
            .then((isGameUser) => {
                if(isGameUser) {
                    next();
                } else {
                    return response.render('404', { 
                        message: "You are not a member of this game." 
                    })
                }
            })
    },
    // Allows a request to go through if the user is not a game user in the specific requested game
    notGameUser: (request, response, next) => {
        // Get user and game id
        user = request.user.id;
        game = request.params.uuid;

        GameController.isGameUser(user, game)
            .then((isGameUser) => {
                if(!isGameUser) {
                    next();
                } else {
                    response.redirect('/dashboard');
                }
            })
    }
}