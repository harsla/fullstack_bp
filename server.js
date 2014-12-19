'use strict';

/**
 * SERVER DEPENDENCIES
 */
var express = require('express'),
    _ = require('lodash'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    expressValidator = require('express-validator'),
    jwt = require('jwt-simple'),
    logger = require('morgan'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    path = require('path'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session);

/**
 * SETTINGS
 */
var config = require('./config/config'),
    secrets = require('./config/secrets'); // sensitive

/**
 * COMPONENTS
 */
var auth = require('./lib/auth'),
    acl = require('./lib/acl');

/*
 * CONTROLLERS
 */
var userController = require('./controllers/user');


/*
 * DATABASE
 */
var mongoose = require('mongoose');
    mongoose.connect(config.mongo.uri, config.mongo.options, function (err, res) {
  if (err) {
    console.log('Connection refused to ' + config.mongo.uri);
    console.log(err);
  } else {
    console.log('Connection successful to: ' + config.mongo.uri);
  }
});

var app = express();

// express configuration
app.set('port', process.env.PORT || 1337);
app.use(cors());
app.use(logger('dev'));
app.use(expressValidator());
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  resave: true,
  saveUninitialized: true,
  store: new RedisStore(config.redis.host, config.redis.port),
  secret: secrets.session
}));

/*
 * API ROUTES
 */
app.post('/api/login', acl, userController.postLogin);
app.post('/api/signup', userController.postSignup);
app.post('/api/add_user', auth, userController.addUser);
app.post('/api/delete_user', auth, userController.deleteUser);
app.post('/api/edit_user', auth, userController.postEditUser);
app.post('/api/forgot', userController.getForgotPassword);
app.post('/api/reset', userController.postResetPassword);
app.get('/api/users', userController.checkEmailAvailable);
app.get('/api/account', auth, acl, userController.getAccount);
app.get('/api/manage', auth, userController.getUsers);
app.get('/api/edit_user', auth, userController.getEditUser);


/*
 * PRETTY URL HANDLER
 */
app.get('*', function(req, res) {
    res.redirect('/#' + req.originalUrl);
});

/*
 * 404 CATCH
 */
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/**
 * ERROR HANDLING
 * development error handler will print stacktrace
 * production error handler no stacktraces leaked to user
 */


if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*
 * START HTTP SERVER
 */
app.listen(app.get('port'), function() {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
