var express = require('express');
var router = express.Router();
const userController = require('../../controllers/Users');
const passport = require('../../config/passport');
const pusher = require('../../config/pusher');
const { isAuthed, notAuthed } = require('../../middleware/auth');

// Creates a user and saves their account to the database.
router.post('/register', notAuthed, (req, res, next) => {
  userController.create(req, res, next);
});

// Authentication endpoint for Pusher.
router.post('/pusher', isAuthed, (req, res, next) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const presenceData = {
    user_id: req.user.id,
    user_info: { username: req.user.username }
  };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
})

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
