var User = require('../models/user'),
    jwtauth = require('../lib/jwtauth'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    secrets = require('../config/secrets');

// Log in to an account
// POST /login: :email :password
exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    return res.status(401).send(errors);
  }

  //auth here
  User.findOne({
    email: req.body.email
  }, function(err, user) {

    // user not found
    if (err) {
      return res.status(401).send('Bad email or password');
    }

    // incorrect username
    if (!user) {
      return res.status(401).send('Bad email or password');
    }

    user.comparePassword(req.body.password, function(err, match) {
      if (err) {
        return res.status(401).send('Bad email or password (password)');
      }
      if (match) {
        // User has authenticated OK
        var expires = moment().add(7, 'days').valueOf();
        var token = jwt.encode({
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          },
          exp: expires
        }, secrets.jwt);

        res.json({
          token: token,
          exp: expires
        });
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

  user.save(function(err) {
    if (err)
      return res.status(409).send('email already exsists').end();
    res.status(200).send('user ' + req.body.name + ' created').end();
  });
};

// Create a new account (can set permissions)
// POST /add_user :name :email :password
exports.addUser = function(req, res, next) {
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

  user.save(function(err) {
    if (err)
      return res.status(409).send('email already exsists').end();
    res.status(200).send('user ' + req.body.name + ' created').end();
  });
};

// Create a new account (can set permissions)
// POST /delete_user :user_object
exports.deleteUser = function(req, res, next) {
  req.assert('_id', 'User ID must be valid').len(24);

  var errors = req.validationErrors();

  if (errors) {
    return res.status(409).send(errors).end();
  }

  User.remove({
    _id: req.body._id
  }, function(err) {
    if (err) return next(err);
    res.status(200).send('user ' + req.body.name + ' deleted').end();
  });
};

// Edit an exsiting account
// POST /edit_user :user_object
exports.editUser = function(req, res, next) {
  req.assert('_id', 'User ID must be valid').len(24);

  var errors = req.validationErrors();

  if (errors) {
    return res.status(409).send(errors).end();
  }

  User.findById(req.body._id, function(err, user) {
    if (err) return next(err);
    res.status(200).send(user).end();
  });

};


// GET /account :token(h)
exports.getAccount = function(req, res) {
  res.status(200).send(req.user).end();
};

exports.checkEmailAvailable = function(req, res, next) {
  if (!req.query.email) {
    return res.send(400, {
      message: 'Email parameter is required.'
    });
  }

  User.findOne({
    email: req.query.email
  }, function(err, user) {
    if (err) return next(err);
    res.send({
      available: !user
    });
  });
};

exports.getUsers = function(req, res, next) {
  User.find(function(err, users) {
    if (err) return next(err);
    res.send(users);
  });
};
