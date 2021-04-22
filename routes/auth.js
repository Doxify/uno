var express           = require('express');
var router            = express.Router();
const userController  = require('../controllers/Users');
const passport        = require('../config/passport');
const { isAuthed, notAuthed } = require('../middleware/routeProtectors');

/* GET users listing. */
router.get('/', isAuthed, (request, response, next) => {
  console.log(request.user);
  response.send('respond with a resource');
});

router.post('/register', notAuthed, (request, response, next) => {
  userController.create(request, response, next);
});

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  (request, response, next) => {
    // Store the user object in the session.
    response.redirect('/');
  });

router.get('/logout', isAuthed, (request, response, next) => {
    request.logout();
    response.redirect('/');
  });

module.exports = router;
