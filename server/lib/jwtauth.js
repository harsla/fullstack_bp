var url = require('url'),
    UserModel = require('../models/user'),
    jwt = require('jwt-simple');

module.exports = function(req, res, next) {
  var parsed_url = url.parse(req.url, true),
    token = (req.body && req.body.access_token) || parsed_url.query.access_token || req.headers["x-access-token"];
  if (token) {
    try {
      var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
      if (decoded.exp <= Date.now()) {
        res.end('Access token has expired', 400);
      }
      UserModel.findOne({
        '_id': decoded.iss
      }, function(err, user) {
        if (!err) {
          req.user = user;
          return next();
        }
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};
