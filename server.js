var express = require('express'),
    bodyParser = require('body-parser'),
    expressValidator = require('express-validator'),
    jwauth = require('./lib/jwtauth'),
    acl = require('./lib/acl'),
    cors = require('cors'),
    path = require('path');

// sensitive
var secrets = require('./config/secrets');

// controllers
var userController = require('./controllers/user'),
    authController = require('./controllers/auth');

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
app.post('/api/login', acl, authController.postLogin);
app.post('/api/signup', authController.postSignup);
app.post('/api/forgot', authController.getForgotPassword);
app.post('/api/reset', authController.postResetPassword);
app.post('/api/confirm', authController.postConfirmEmail);
app.post('/api/resend', authController.resendActivationEmail);
app.post('/api/add_user', jwauth, userController.addUser);
app.post('/api/delete_user', jwauth, userController.deleteUser);
app.post('/api/edit_user', jwauth, userController.postEditUser);
app.get('/api/users', userController.checkEmailAvailable);
app.get('/api/check_activated', userController.checkEmailActivated);
app.get('/api/account', jwauth, acl, userController.getAccount);
app.get('/api/manage', jwauth, acl, userController.getUsers);
app.get('/api/edit_user', jwauth, userController.getEditUser);


// handle pretty urls
app.get('*', function(req, res) {
    'use strict';
    res.redirect('/#' + req.originalUrl);
});

// error handling
app.use(function(err, req, res) {
    'use strict';
    res.status(500).body({ message: err.message });
});

// start the server
app.listen(app.get('port'), function() {
    'use strict';
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
