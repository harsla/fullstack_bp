var User = require('../models/user');

module.exports = function (req, res, next) {
    "use strict";
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        //check if the user is locked
        if (User.locked) {
            res.status(403).send('account locked').end();
        } else {
            // do acl stuff here
            next();
        }
    });
};
