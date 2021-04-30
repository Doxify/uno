const { response, request } = require('express');
var express = require('express');
var router = express.Router();
const GameController = require('../controllers/game')
const { isAuthed, notAuthed } = require('../middleware/routeProtectors');

router.get('/create-game', isAuthed, function(request, response, next) {

    GameController.createGame(request, response, next);

});

router.get('/:uuid/join', isAuthed, function(request, response, next) {
    GameController.joinGame(request, response, next);
});

router.get('/:uuid', isAuthed, function(request, response, next) {
    return response.render('game_room', {title: 'Game', user: request.user});
});

router.post('/:uuid/play-card', function(request, response, next) {
    // Validate post data
    // If validation fails, still tell user through websockets
    // Tell client 200 OK response.send(200);
    // Update game state
    // Broadcast relevant state to players through websockets
});

router.post('/:uuid/draw-card', function(request, response, next) {
    // Validate post data
    // If validation fails, still tell user through websockets
    // Tell client 200 OK response.send(200);
    // Update game state
    // Broadcast relevant state to players through websockets
});

module.exports = router;


