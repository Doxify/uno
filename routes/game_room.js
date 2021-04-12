var express = require('express');
var router = express.Router();

/* Get game room page */
router.get('/', function(req,res, next) {

    res.render('game_room', {title: 'Game Room'})

});

module.exports = router