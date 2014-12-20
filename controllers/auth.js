var User = require('../models/user'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
    sgTransport = require('nodemailer-sendgrid-transport'),
    crypto = require('crypto'),
    async = require('async'),
    secrets = require('../config/secrets');


// Log in to an account
// POST /api/login: :email :password
exports.postLogin = function (req, res) {
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
                return res.status(401).send('Bad Password');
            }
        });
    });
};

// Create a new account
// POST /api/signup :name :email :password
exports.postSignup = function (req, res) {
    req.assert('name', 'Name can not be empty').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors);
    }

    //Send a confirmation email
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        }, function (token, done) {
            var user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                emailConfirmationToken: token,
                emailConfirmationDate: Date.now()
            });
            user.save(function (err) {
                done(err, token, user);
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
                subject: 'Welcome to ' + secrets.company + ', please confirm your account',
                text: 'Confirming your account will allow you to log in and all future notifications will be sent to this email address.\n\n' +
                'Please visit the following url:\n\n' +
                'http://' + req.headers.host + '/confirm/' + token + '\n'
            };

            mailer.sendMail(email, function (err) {
                if (err) {
                    console.log(err);
                }
                done('An e-mail has been sent to ' + user.email + ' with instructions to activate the account.');
            });
        }

    ], function (message) {
        return res.status(200).send(message).end();
    });
};

// Validate the users email address
// POST /api/confirm :token
exports.postConfirmEmail = function (req, res) {
    User.findOne({
        emailConfirmationToken: req.body.token
        //resetPasswordExpires: {$gt: Date.now()}
    }, function (err, user) {
        console.log(user);
        if (!user) {
            return res.status(409).send('Token is no longer valid.').end();
            //TODO: We should delete the account here.
        }
        user.confirmed = true;
        user.save(function (err) {
            if (err) {
                return res.status(409).send(err).end();
            }
            console.log(user);
            return res.status(200).send('Your account has been activated, please login.')
        });
    });
};

// Request a password reset
// POST /api/reset :token :password
exports.postResetPassword = function (req, res) {
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
                res.status(200).send("Your password has been changed.").end();
            });

        });
    });
};

// Request a password reset
// POST /api/forgot :email
exports.getForgotPassword = function (req, res) {
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
                text: 'You are receiving this message because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
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