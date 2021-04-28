const { response } = require('express');
const Game = require('../database/game');

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
                console.log("got here");
                if(!gameCreated) return GENERIC_ERROR(res);
                return response.redirect('/game');
            });
    },
    joinGame: () => {
        
    },
    getOpenGames: (request, response, next) => {
        
        Game.getAllActiveGames()
        .then((games) => {
            console.log(games);
            return response.render('dashboard', { title: 'Dashboard', user: request.user, games: games });
        })
        
    },

}

module.exports = GameController;