var express = require('express'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    jwauth = require('./lib/jwtauth'),
    jwt = require('jwt-simple'),
    cors = require('cors'),
    path = require('path');

// sensitive
var secrets = require('./config/secrets');

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
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.post('/login', userController.postLogin);
app.post('/signup', userController.postSignup);
app.get('/api/users', userController.checkEmailAvailable);
app.get('/account', jwauth, userController.getAccount);
app.get('/manage', jwauth, userController.getUsers);

// handle pretty urls
app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// error handling
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, { message: err.message });
});

// start the server
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
