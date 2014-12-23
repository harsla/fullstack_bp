var User = require('../models/user'),
    _ = require('lodash-node');

module.exports = function (req, res, next) {
    if (req.user) {
        req.body.email = req.user.email;
    }

    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) {
            return next(err);
        }

        // can't find the user
        if (!user) {
            return res.status(400).send('User not found').end();
        }

        // check if the user is locked
        if (user.locked) {
            return res.status(550).send('Account locked').end();
        }

        // verify the user has a confirmed email
        if (!user.confirmed) {
            return res.status(550).send('Account not activated').end();
        }

        // verify the user has permission to action the resource
        if (requires_role(req.route.path, user)) {
            return res.status(403).send('user does not have access to ' + req.route.path).end();
        }
        next();
    });
};

// Very basic ACL till' I am smart enough to write a better one.
var acl = {
    '/api/account': 1, //admin
    '/api/manage': 1, //admin
    '/api/login': 99 //guest
};

var roles = {
    'admin': 1,
    'user': 2
};

// find the users highest role, and see if it has access
// to the resource.
var requires_role = function (path, user) {
    var role = _.min(_.map(user.groups, function (item) {
        return roles[item];
    }));

    if (role <= acl[path]) {
        return false;
    }
    return true;
};

