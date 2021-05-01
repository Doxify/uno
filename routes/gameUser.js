var express = require('express');
var router = express.Router();
const GameUserController = require('../controllers/GameUsers');
const { isAuthed, notAuthed } = require('../middleware/routeProtectors');

router.get('/create/:game_id', isAuthed, (req, res, next) => {
  GameUserController.create(req, res, next);
});

module.exports = router;
