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
  console.log(JSON.stringify(req.body));
  exports.post(res, req, err, function(body){
    console.log("standard post validated completed!");
    validateAccessTokenForUser(body, function(userId){
      console.log("userAuthorizedPost completed!!" + userId);
      body.user_id = userId;
      success(body);
    });
  })
}

exports.grantAccessToken = function(body, err, success) {

  // Get required OAuth2 fields from HTTP
  if(body.grant_type == "password" && body.email && body.password) {
    // Find user by email
    users.findUser({"email": body.email}, function(user){
      // Validate password from DB with password from HTTP params
      authenticateUser(user, body, function() {
        // Find Access token from current session_id or create a new one.
        db_functions.findAuthToken({"session_id": body.sessionID}, function(token) {
          if(token) {
            success(token);
          }else {
            createToken(body, user, success, exports.grantAccessToken);
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
    console.log("Client Authenticated through API-KEY");
    return success(req.body);
  }else if(req.headers.hasOwnProperty('authorization')) {
    db_functions.findAuthToken({"access_token": req.headers.authorization}, function(token) {
      if(token) {
        console.log("Client Authenticated through ACCESS TOKEN");
        success(req.body);
      }else {
        return new Error("Access Token invalid!");
      }
    })
  }else {
    return new Error("Can't authenticate client");
  }
}

authenticateUser = function(user, body, success) {
  crypto.validateHash(body, user.salt, function(challenge){
    if(challenge == user.password) {
      console.log("AuthenticateUser - TRUE");
      success();
    }else {
      console.log("AuthenticateUser - FALSE");
    }
  })
}


createToken = function(body, user, success, next) {
  var token = {
    "access_token": user.email,
    "session_id": body.sessionID,
    "expires_in": "2017",
    "token_type": "bearer",
    "user_id": user.id
  };

  db_functions.saveAuthToken(user, token, function(token){
    next(body, null, success);
  })
}
