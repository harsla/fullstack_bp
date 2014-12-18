var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  locked: { type: Boolean, default: false}
});

userSchema.pre('save', function(next) {
  'use strict';
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(12, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  'use strict';
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', userSchema);
