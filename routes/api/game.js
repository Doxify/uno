var express = require('express');
var router = express.Router();
const GameController = require('../../controllers/Game');
const { isAuthed, notAuthed } = require('../../middleware/auth'); 
const { gameExists, isGameUser, notGameUser } = require('../../middleware/game');

router.get('/create', isAuthed, function(request, response, next) {
    GameController.create(request, response, next);
});

router.get('/getList', isAuthed, function(request, response, next) {
    GameController.getList(request, response, next);
});

router.get('/join/:uuid', 
    isAuthed, 
    gameExists, 
    notGameUser, 
    function(request, response, next) {
        GameController.join(request, response, next);
});

router.post('/makeMove/:uuid', 
    isAuthed, 
    gameExists, 
    isGameUser, 
    function(request, response, next) {
        // Validate post data
        // If validation fails, still tell user through websockets
        // Tell client 200 0k
        // update game state
        // broadcast game state
});

module.exports = router;


