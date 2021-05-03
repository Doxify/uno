var express = require('express');
var router = express.Router();
const GameController = require('../../controllers/Game')
const { isAuthed, notAuthed, gameExists, isGameUser, notGameUser } = require('../../middleware/routeProtectors');

router.get('/create', isAuthed, function(request, response, next) {
    GameController.create(request, response, next);
});

router.get('/join/:uuid', isAuthed, gameExists, notGameUser, function(request, response, next) {
    GameController.join(request, response, next);
});

router.get('/getList', isAuthed, function(request, response, next) {
    GameController.getList(request, response, next);
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


