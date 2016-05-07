/**
* Connect to mongo through mongoose.
**/

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var crypto   = require('crypto');
mongoose.connect('mongodb://localhost/production');

/**
* Mongo -> mongoose setup
**/

var oauthTokenSchema = new mongoose.Schema({
  access_token: String,
  session_id: String,
  expires_in: String,
  token_type: String,
  user_id: String
})
var oauthTokenModel = mongoose.model("oauthTokens", oauthTokenSchema);

var permissionTicketSchema = new mongoose.Schema({
  ticket: String,
  user_id: String,
  resource_id: String,
  scope: String
})
var permissionTicketModel = mongoose.model("permissionTickets", permissionTicketSchema);

var resourceSchema = new mongoose.Schema({
  resource_id: String,
  resource_uri: String,
  user_id: String
})
var resourceModel = mongoose.model("resource", resourceSchema);

/**
* CRUD Functions:
**/

exports.saveAuthToken = function(user, token, success) {
  oauthTokenModel.find({access_token: token.access_token}).remove(null);

  console.log("Saving token: " + JSON.stringify(token));
  new oauthTokenModel(token).save(function(e) {
    success(e);
  })
}

exports.findAuthToken = function(sessionID, success) {
  oauthTokenModel.findOne(sessionID, function(err, obj) {
    if(obj) {
      success({
        "access_token": obj.access_token,
        "expires_in": obj.expires_in,
        "token_type": obj.token_type,
      });
    }else {
      success(false);
    }
  })
}

exports.findAuthUser = function(sessionID, success) {
  oauthTokenModel.findOne(sessionID, function(err, obj) {
    if(obj) {
      success(obj.user_id);
    }else {
      console.log("No access tokens associated with session");
    }
  })
}

exports.savePermissionTicket = function(ticket, success) {
  console.log("Saving this ticket: " + JSON.stringify(ticket));
  ticket.ticket = crypto.randomBytes(32).toString('hex');
  new permissionTicketModel(ticket).save(function(e) {
    success(ticket);
  })
}

exports.findPermissionTicket = function(ticket, success) {
  permissionTicketModel.findOne(ticket, function(err, obj) {
    if(obj) {
      success(obj);
    }
  })
}

exports.saveResource = function(resource, success) {
  // Setup new resource
  var newResource = {};
  newResource.resource_uri = resource.resource_uri;
  newResource.user_id = resource.user_id;
  console.log("Saving resource: " + JSON.stringify(resource));
  newResource.resource_id = crypto.randomBytes(32).toString('hex');

  // save the resource
  new resourceModel(newResource).save(function(e) {
    success(newResource); // Return the saved resource.
  })

}

exports.findResource = function(resource, success) {

  resourceModel.find(resource, function(err, obj) {

    if(obj) {
      success(obj);
    }else {
      // not found!
    }

  })
}
