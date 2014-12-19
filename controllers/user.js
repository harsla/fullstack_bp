'use strict';

var User = require('../models/user'),
    auth = require('../lib/auth'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
    sgTransport = require('nodemailer-sendgrid-transport'),
    crypto = require('crypto'),
    async = require('async'),
    secrets = require('../config/secrets');

// Log in to an account
// POST /login: :email :password
exports.postLogin = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        return res.status(401).send(errors);
    }

    //auth here
    User.findOne({
        email: req.body.email
    }, function (err, user) {

        // user not found
        if (err) {
            return res.status(401).send('Bad email or password');
        }

        // incorrect username
        if (!user) {
            return res.status(401).send('User Not found');
        }

        user.comparePassword(req.body.password, function (err, match) {
            if (err) {
                return res.status(401).send('Bad Password');
            }
            if (match) {
                // User has authenticated OK
                var expires = moment().add(7, 'days').valueOf();
                var token = jwt.encode({
                    user: {
                        id: user._id,
                        username: user.username,
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
                return res.status(401).send('Bad Password');
            }
        });
    });
};

// Create a new account
// POST /signup :username :email :password
exports.postSignup = function (req, res, next) {

    req.assert('username', 'Username can not be empty').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors);
    }

    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    user.save(function (err) {
        if (err) {
            return res.status(409).send('email already exists').end();
        }
        res.status(200).send('user ' + req.body.name + ' created').end();
    });
};

// Create a new account (can set permissions)
// POST /add_user :username :email :password
exports.addUser = function (req, res, next) {

    req.assert('username', 'Username can not be empty').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors);
    }

    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    user.save(function (err) {
        if (err) {
            return res.status(409).send('email already exsists').end();
        }
        res.status(200).send('user ' + req.body.username + ' created').end();
    });
};

// Create a new account (can set permissions)
// POST /delete_user :user_object
exports.deleteUser = function (req, res, next) {

    req.assert('_id', 'User ID must be valid').len(24);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors).end();
    }

    User.remove({
        _id: req.body._id
    }, function (err) {
        if (err) {
            return next(err);
        }
        res.status(200).send('user ' + req.body.username + ' deleted').end();
    });
};

// Edit an existing account
// POST /edit_user :user_object
exports.postEditUser = function (req, res, next) {

    req.assert('_id', 'User ID must be valid').len(24);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors).end();
    }

    User.findById(req.body._id, function (err, doc) {
        if (doc) {
            doc.username = req.body.username;
            doc.email = req.body.email;

            if (req.body.password) {
                doc.password = req.body.password;
            }

            if (req.body.locked) {
                doc.locked = req.body.locked;
            }
            doc.save(function (err) {
                if (err) {
                    return res.status(409).send(err).end();
                }
                res.status(200).send('OK').end();
            });
        }
    });
};

// GET /account :token(h)
exports.getAccount = function (req, res) {

    res.status(200).send(req.user).end();
};

exports.checkEmailAvailable = function (req, res, next) {

    if (!req.query.email) {
        return res.send(400, {
            message: 'Email parameter is required.'
        });
    }

    User.findOne({
        email: req.query.email
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        res.send({
            available: !user
        });
    });
};

// returns all users
// GET /manage
exports.getUsers = function (req, res, next) {

    User.find(function (err, users) {
        if (err) {
            return next(err);
        }
        res.send(users);
    });
};

// Edit an exsiting account
// GET /edit_user :user_object
exports.getEditUser = function (req, res, next) {

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors).end();
    }

    User.findById(req.query.user_id, function (err, user) {
        if (err) {
            return next(err);
        }
        res.status(200).send(user).end();
    });
};


// Request a password reset
// POST /reset :user_object
exports.postResetPassword = function (req, res) {

    console.log(req);
    User.findOne({
        resetPasswordToken: req.body.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    }, function (err, user) {
        if (!user) {
            return res.status(409).send('Password reset token is no longer valid.').end();
        }
        user.password = req.body.params.password;
        user.save(function (err) {
            if (err) {
                return res.status(409).send(err).end();
            }


            var options = {
                auth: {
                    api_user: secrets.smtpuser,
                    api_key: secrets.smtppassword
                }
            };
            var mailer = nodemailer.createTransport(sgTransport(options));

            var email = {
                from: 'noreply@' + secrets.company + '.com',
                to: user.email,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };

            mailer.sendMail(email, function (err) {
                if (err) {
                    console.log(err);
                }
                res.status(200).send('Your password has been changed.').end();
            });

        });
    });
};

// Request a password reset
// GET /forgot :user_object
exports.getForgotPassword = function (req, res, next) {

    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        }, function (token, done) {
            User.findOne({email: req.body.email}, function (err, user) {
                if (!user) {
                    return res.status(409).send('No account with that email address exists.').end();
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var options = {
                auth: {
                    api_user: secrets.smtpuser,
                    api_key: secrets.smtppassword
                }
            };
            var mailer = nodemailer.createTransport(sgTransport(options));

            var email = {
                from: 'noreply@' + secrets.company + '.com',
                to: user.email,
                subject: 'Password Reset Request',
                text: 'You are receiving this message because you (or someone else)' +
                'have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser' +
                'to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password' +
                 'will remain unchanged.\n'
            };

            mailer.sendMail(email, function (err) {
                if (err) {
                    console.log(err);
                }
                done('An e-mail has been sent to ' + user.email + ' with further instructions.');
            });
        }

    ], function (message) {
        return res.status(200).send(message).end();
    });
};