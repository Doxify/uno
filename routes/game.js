var express = require('express');
var router = express.Router();
const { isAuthed } = require('../middleware/auth');
const { gameExists, isGameUser, isActiveGame, isNotActiveGame } = require('../middleware/game');

/* Get game room page */
router.get('/:uuid', isAuthed, gameExists, isGameUser, isActiveGame, function(req,res, next) {
    res.render('game', { title: 'Game Room', user: req.user, gameId: req.params.uuid })
});

router.get('/lobby/:uuid', isAuthed, gameExists, isNotActiveGame, function(req, res, next) {
    res.render('lobby', { title: 'Lobby', user: req.user, gameId: req.params.uuid });
});

module.exports = router