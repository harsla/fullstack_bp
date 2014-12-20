var User = require('../models/user'),
    moment = require('moment');


// Create a new account (can set permissions)
// POST /api/add_user :name :email :password
exports.addUser = function (req, res) {
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

    user.save(function (err) {
        if (err) {
            return res.status(409).send('email already exists').end();
        }
        res.status(200).send('user ' + req.body.name + ' created').end();
    });
};

// Remove an account
// POST /api/delete_user :user_object
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
        res.status(200).send('user ' + req.body.name + ' deleted').end();
    });
};

// Edit an existing account
// POST /api/edit_user :user_object
exports.postEditUser = function (req, res) {
    req.assert('_id', 'User ID must be valid').len(24);

    var errors = req.validationErrors();

    if (errors) {
        return res.status(409).send(errors).end();
    }

    User.findById(req.body._id, function (err, doc) {
        if (doc) {
            doc.name = req.body.name;
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
                res.status(200).send("OK").end();
            });
        }
    });
};

// Gets user account data
// GET /api/account :jwt
exports.getAccount = function (req, res) {
    res.status(200).send(req.user).end();
};

// Checks if the email is already taken TODO: protect with fail2ban
// GET /api/users :email
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
// GET /api/manage
exports.getUsers = function (req, res, next) {
    User.find(function (err, users) {
        if (err) {
            return next(err);
        }
        res.send(users);
    });
};

// user: check if the email has been activated
// GET /api/check_activated :email
exports.checkEmailActivated = function (req, res, next) {
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
            activated: user.confirmed,
            sent: user.emailConfirmationDate
        });
    });
};

// Edit an existing account
// GET /api/edit_user :user_object
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