var User = require('../models/user');

module.exports = function (req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    //check if the user is locked
    if (user.locked) {
      res.status(403).send('account locked').end();
    } else {
      // do acl stuff here
      next();
    }
  });
};
