var User = require('../models/user');

module.exports = function (req, res, next) {

    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send('User not found').end();
        }

        // check if the user is locked
        if (user.locked) {
            return res.status(550).send('Account locked').end();
        }
        // make sure the user has a confirmed email
        if (!user.confirmed) {
            return res.status(550).send('Account not activated').end();
        }
        // Do acl stuff here
        next();

    });
};
