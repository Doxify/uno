var express = require('express');
var router = express.Router();
const GameController = require('../controllers/game')
const { isAuthed, notAuthed } = require('../middleware/routeProtectors');

router.get('/create-game', function(request, response, next) {

    GameController.createGame(request, response, next);

});



router.post('/game/:id/play-card', function(request, response, next) {
    // Validate post data
    // If validation fails, still tell user through websockets
    // Tell client 200 OK response.send(200);
    // Update game state
    // Broadcast relevant state to players through websockets
});

module.exports = router;


