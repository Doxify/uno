var express = require('express');
var router = express.Router();
const userController = require('../controllers/Users');
const passport = require('../config/passport');
const { isAuthed, notAuthed } = require('../middleware/routeProtectors');

router.post('/register', notAuthed, (req, res, next) => {
  userController.create(req, res, next);
});

// Uses passport to authenticate a user.
router.post('/login', 
  passport.authenticate('local'), 
  (req, res, next) => {
    // Store the user object in the session.
    res.json({
      status: 'success',
      message: 'Successfully authenticated.'
    });
});

// Uses passport to log a user out by destroying their session.
router.get('/logout', isAuthed, (req, res, next) => {
  req.logout();
  res.json({
    status: 'success',
    message: 'Successfully logged out.'
  });
});

module.exports = router;
