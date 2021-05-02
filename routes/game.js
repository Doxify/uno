var express = require('express');
var router = express.Router();
const { isAuthed } = require('../middleware/routeProtectors');

/* Get game room page */
router.get('/:uuid', isAuthed, function(req,res, next) {
    res.render('game', { title: 'Game Room', user: req.user, gameId: req.params.uuid })

});

module.exports = router