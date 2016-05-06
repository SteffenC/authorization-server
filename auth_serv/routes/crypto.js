var crypto = require('crypto');

exports.createHash = function(user, callback){
  var salt = crypto.randomBytes(32).toString('hex');
  user.salt = salt;
  user.password += salt;
  user.password = crypto.createHash('sha256').update(user.password).digest('hex');

  callback(user);
}

exports.validateHash = function(user, salt, callback) {
  var password = user.password;
  password += salt;
  password = crypto.createHash('sha256').update(password).digest('hex');
  callback(password);
}
