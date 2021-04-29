const { response } = require('express');
const Game = require('../database/game');
const GameUser = require('../database/GameUser');
const GameUserController = require('./GameUsers');

const GENERIC_ERROR = function(response) {
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
                if(!gameCreated) return GENERIC_ERROR(response);

                // Game was successfully created and inserted in database


                // Create Game User and insert in database
                GameUserController.create(request.user.id, gameCreated.id)
                    .then((gameUserCreated) => {
                        if(!gameUserCreated) return GENERIC_ERROR(response);

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
        console.log(request.params.uuid);

        // Check if game is full
        // Create GameUser
        const gameUser = GameUserController.create(request.user.id, request.params.uuid)
            .then((gameUserCreated) => {
                if(!gameUserCreated) return GENERIC_ERROR(response);

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

    },
    getOpenGames: (request, response, next) => {
        
        Game.getAllActiveGames()
        .then((games) => {
            return response.render('dashboard', { title: 'Dashboard', user: request.user, games: games });
        })
        
    },

}

module.exports = GameController;