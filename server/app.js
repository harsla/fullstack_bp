var express = require('express'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    jwt = require('jwt-simple'),
    jwauth = require('./lib/jwtauth'),
    cors = require('cors');

// sensitive
var secrets = require('./config/secrets');

var requireAuth = function(req, res, next) { //TODO: Move this to lib
  // console.log(req.user);
  if (!req.user) {
    res.end('Not authorized', 401);
  }	else {
    next();
  }
};

// controlers
var userController = require('./controllers/user');

// Database configuration
var mongoose = require('mongoose');
    mongoose.connect(secrets.db);

var app = express();

// express configuration
app.set('port', process.env.PORT || 1337);
app.use(cors());
app.use(expressValidator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.post('/login', userController.postLogin);
app.post('/signup', userController.postSignup);
app.get('/account', jwauth, requireAuth, userController.getAccount);

// start the server
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
