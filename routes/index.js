var express = require('express');
var router = express.Router();
const { isAuthed, notAuthed } = require('../middleware/routeProtectors');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', notAuthed, function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/register', notAuthed, function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'Dashboard' });
});


module.exports = router;
