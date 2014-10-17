var User = require('../models/user'),
    jwtauth = require('../lib/jwtauth'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    secrets = require('../config/mmmhmm');

// Log in to an account
// POST /login: :email :password
exports.postLogin = function(req, res, next) {
  req.checkHeader('email', 'Email is not valid').isEmail();
  req.checkHeader('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(401).send(errors);
  }

  //auth here
  User.findOne({ email: req.headers.email }, function (err, user) {

    // user not found
    if (err) {
      return res.status(401).send('Bad email or password');
    }

    // incorrect username
    if (!user) {
      return res.status(401).send('Bad email or password');
    }

    user.comparePassword(req.headers.password, function(err, match) {
      if (err) {
        return res.status(401).send('Bad email or password (password)');
      }
      if (match) {
        // User has authenticated OK
          var expires = moment().add(1, 'days').valueOf();
          var token = jwt.encode({
            iss: user.id,
            exp: expires
          }, secrets.jwt);

          res.json({
            token : token,
            expires: expires,
            user: user.toJSON()
          });
          res.status(200).end();
      } else {
        //bad password
        return res.status(401).send('Bad username or password (bad password)');
      }
    });
  });
};

// Create a new account
// POST /signup :name :email :password
exports.postSignup = function(req, res, next) {
  req.assert('name', 'Name can not be empty').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);

  var errors = req.validationErrors();

  if (errors) {
   return res.status(409).send(errors);
  }

var user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  user.save(function(err){
    if (err)
      return res.status(409).send('email already exsists').end();
    res.status(200).send('user ' + req.body.name + ' created').end();
  });
};
