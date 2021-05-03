const GameController = require("../controllers/game");

module.exports = {
    // Allows a request to go through if a user session is present.
    isAuthed: (request, response, next) => {
        if(request.user) {
            next();
        } else {
            response.redirect('/login');
        }
    },
    // Allows a request to go through if a user session is NOT present.
    notAuthed:  (request, response, next) => {
        if(!request.user) {
            next();
        } else {
            response.redirect('/');
        }
    },
    // Allows a request to go through if the game exists in the database
    gameExists: (request, response, next) => {
        // Get game id
        game = request.params.uuid;

        // Validate that game is the correct UUIDv4 Format
        uuidRegex = new RegExp('/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i');

        if(!uuidRegex.test(game)) {
            console.log("got here");
            return response.redirect('/dashboard');
        }


        GameController.gameExists(game)
            .then((gameExists) => {
                if(gameExists) {
                    next();
                } else {
                    response.redirect('/dashboard');
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
                    response.redirect('/dashboard');
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