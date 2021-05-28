const express = require('express');
const router = express.Router();
const ChatController = require('../../controllers/Chat');
const { isAuthed } = require('../../middleware/auth');

router.post('/', isAuthed, (req, res, next) => {
  ChatController.send(req, res, next);
});

module.exports = router;
