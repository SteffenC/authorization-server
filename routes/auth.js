var status       = require('./errorHandling.js');
var db_functions = require('../db_logic/db.js');
var users        = require('./user.js');
var crypto       = require('./crypto.js');
var resource     = require('./resource.js');

exports.post = function(res, req, err, success, next){
  authenticateClient(req, function(status){
    if(status) {
      if(next) {
        req.body.sessionID = req.sessionID;
        next(req.body, err, success);
      }else {
        success(req.body);
      }
    }else {
      err(403);
    }
  })
}

exports.userAuthorizedPost = function(res, req, err, success) {
  exports.post(res, req, err, function(body){
    validateAccessTokenForUser(body, function(userId){
      body.user_id = userId;
      success(body);
    });
  })
}

exports.clientAuthorizedPost = function(res, req, err, success) {
  exports.post(res, req, err, function(body) {
    validateAccessTokenForUser(body, function(clientId) {
      body.client_id = clientId;
      success(body);
    })
  })
}

exports.grantAccessToken = function(body, err, success) {

  // Get required OAuth2 fields from HTTP
  if(body.grant_type == "password" && body.client_id && body.secret) {
    // Find user by email
    users.findClient({"client_id": body.client_id, "secret": body.secret}, function(client){
      // Validate password from DB with password from HTTP params
      authenticateClientCredentials(client, body, function() {
        // Find Access token from current session_id or create a new one.
        db_functions.findAuthToken({"session_id": body.sessionID}, function(token) {
          if(token) {
            success(token);
          }else {
            createToken(body, client, success, exports.grantAccessToken);
          }
        });
      })
    });
  }
}

validateAccessTokenForUser = function(body, success){
  // db_functions.findAuthUser({"access_token": body.token, "session_id": body.sessionID}, function(userId){
  //   success(userId);
  // })

  // test:
  db_functions.findAuthUser({"access_token": body.access_token}, function(userId){
    success(userId);
  })
}

authenticateClient = function(req, success){

  // GET API KEY
  if(req.headers.hasOwnProperty('authorization') && req.headers.authorization == "key") {
    success(req.body);
  }else if(req.headers.hasOwnProperty('authorization')) {
    db_functions.findAuthToken({"access_token": req.headers.authorization}, function(token) {
      if(token) {
        success(req.body);
      }else {
        return new Error("Access Token invalid!");
      }
    })
  }else {
    return new Error("Can't authenticate client");
  }
}

authenticateClientCredentials = function(client, body, success) {
  success(client);
}


createToken = function(body, client, success, next) {
  var token = {
    "access_token": "rs-highfive",
    "session_id": body.sessionID,
    "expires_in": "2017",
    "token_type": "bearer",
    "user_id": client.client_id
  };

  db_functions.saveAuthToken(client, token, function(token){
    next(body, null, success);
  })
}
