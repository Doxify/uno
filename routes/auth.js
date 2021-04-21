var express = require('express');
var router = express.Router();
const UserController = require('../controllers/Users');
const passport = require('../config/passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', (request, response, next) => {
  UserController.create(request, response, next);
});

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', session: true }), 
  (request, response, next) => {
    console.log(request.user);
    response.redirect('/');
  });

router.get('/logout', (request, response, next) => {
    request.logout();
    response.redirect('/');
  });

module.exports = router;
