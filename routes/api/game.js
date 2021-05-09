var express = require('express');
var router = express.Router();
const GameController = require('../../controllers/Game');
const { isAuthed, notAuthed } = require('../../middleware/auth'); 
const { gameExists, isGameUser, notGameUser, isActiveGame } = require('../../middleware/game');

router.get('/create', isAuthed, function(request, response, next) {
    GameController.create(request, response, next);
});

router.get('/getList', isAuthed, function(request, response, next) {
    GameController.getList(request, response, next);
});

router.get('/join/:uuid', isAuthed, gameExists, notGameUser, (request, response, next) => {
    GameController.join(request, response, next);
});

router.get('/state/:uuid', isAuthed, gameExists, isGameUser, isActiveGame, (request, response, next) => {
    GameController.getGameState(request.params.uuid, request.user.id);
    return response.status(200);
});

// REQUIRED BODY:
// - type [-1 = draw card, -2 = play card]
// - cardId [id of card from base deck]
router.post('/makeMove/:uuid', isAuthed, gameExists, isGameUser, isActiveGame, (request, response, next) => {
    GameConstroller.handleMove(request, response, next);
});

module.exports = router;


