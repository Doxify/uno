var express = require('express');
var router = express.Router();
const UserController = require('../controllers/Users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', (request, response, next) => {
  UserController.create(request, response, next);
})



module.exports = router;
