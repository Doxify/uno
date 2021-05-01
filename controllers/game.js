const { response } = require('express');
const Game = require('../database/Game');
const GameUser = require('../database/GameUser');
const GameUserController = require('./GameUsers');
const GameDeckController = require('./GameDeck');

const GENERIC_ERROR = function (response) {
    return response.json({
        status: 'failure',
        message: 'An error occurred while creating new game.'
    });
};

const GameController = {
    createGame: (request, response, next) => {
        const game = new Game();

        game.save()
            .then((gameCreated) => {
                if (!gameCreated) return GENERIC_ERROR(response);

                // Game was successfully created and inserted in database


                // Create Game User and insert in database
                GameUserController.create(request.user.id, gameCreated.id)
                    .then((gameUserCreated) => {
                        if (!gameUserCreated) return GENERIC_ERROR(response);

                        // Game User was successfully created and inserted in database

                        // Redirect to game room page
                        return response.redirect(`/game/${gameUserCreated.game}`);
                    })
                    .catch((err) => {
                        console.log(err);

                        return response.json({
                            status: 'failure',
                            message: 'Error occurred while creating Game User'
                        });
                    })
            })
            .catch((err) => {
                console.log(err);

                return response.json({
                    status: 'failure',
                    message: 'Error occurred while creating and joining Game.'
                });
            })
    },
    joinGame: (request, response, next) => {

        // Get number of players in game and check to make sure game is not full
        Game.getNumOfPlayers(request.params.uuid)
            .then((numPlayers) => {

                if (numPlayers >= GameUser.MAX_GAME_USERS_PER_GAME) {
                    // Game is full
                    return response.json({
                        status: 'failure',
                        message: 'Game is full. Please join a different game lobby or create a new game.'
                    })
                }

                // Game isn't full, so create Game User

                const gameUser = GameUserController.create(request.user.id, request.params.uuid)
                    .then((gameUserCreated) => {
                        if (!gameUserCreated) return GENERIC_ERROR(response);

                        // Game User was successfully created and inserted in database

                        // Redirect to game room page
                        return response.redirect(`/game/${gameUserCreated.game}`);
                    })
                    .catch((err) => {
                        console.log(err);

                        return response.json({
                            status: 'failure',
                            message: 'Error occurred while joining Game.'
                        });
                    });
            });
    },
    getOpenGames: (request, response, next) => {

        Game.getAllActiveGames()
            .then((games) => {

                // For each game, need to get the number of players
                var promises = [];

                games.forEach((game) => {
                    // Add get number of players promise to promises[]
                    promises.push(
                        Game.getNumOfPlayers(game.id)
                            .then((numPlayers) => {
                                // Add numPlayers variable to Game object
                                game.numPlayers = numPlayers;

                                return game;
                            })
                            .catch((err) => {
                                console.log(err);

                                return response.json({
                                    status: 'failure',
                                    message: 'Error occurred while getting number of players for each game.'
                                })
                            })
                    );
                });
                Promise.all(promises)
                    .then(() => {

                        // TODO: Check to see if user is currently in any of the games
                        return response.render('dashboard', { title: 'Dashboard', user: request.user, games: games });
                    })
            })
            .catch((err) => {
                console.log(err);

                return response.json({
                    status: 'failure',
                    message: 'Error occurred while getting open games.'
                });
            })

    },
    startGame: (game) => {
        // Create new Game Deck in database
        GameDeckController.createGameDeck(game);
    }
}

module.exports = GameController;