var express = require('express');
var router = express.Router();
const GamePusherController = require('../controllers/GamePusher');
const { isAuthed } = require('../middleware/routeProtectors');

/* Get game room page */
router.get('/:uuid', isAuthed, function(req,res, next) {
    res.render('game', { title: 'Game Room', user: req.user, gameId: req.params.uuid })

});

router.get('/lobby/:uuid', isAuthed, function(req, res, next) {
    res.render('lobby', { title: 'Lobby', user: req.user, gameId: req.params.uuid });
    setTimeout(() => {
        GamePusherController.TRIGGER_PLAYER_JOINED_LOBBY(req.params.uuid);
    }, 1000);

});

module.exports = router