var jwt = require('jwt-simple'),
    secrets = require('../config/secrets');


module.exports = function (req, res, next) {
  if (req.headers['x-access-token']) {
    var token = req.headers['x-access-token'];
    try {
      var decoded = jwt.decode(token, secrets.jwt);
      if (decoded.exp <= Date.now()) {
        res.status(400).send('Access token has expired').end();
      } else {
        req.user = decoded.user;
        return next();
      }
    } catch (err) {
      return res.status(500).send('Error parsing token');
    }
  } else {
    return res.status(401);
  }
};
