var crypto = require("./crypto.js");
var db_functions = require("../db_logic/db.js");

exports.validateModel = function(user, success, next) {
  if(user.password && user.email && user.firstname && user.lastname, user.grant_type) {
    success(user, next);
  }
}

exports.findUser = function(search, success) {
  db_functions.findUser(search, function(err, user){
    success(user);
  })
}

exports.fetchSalt = function(search, success) {
  db_functions.fetchSalt(search, function(err, user){
    success(user);
  })
}
