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
  resource_set_id: String,
  scope: String
})
var permissionTicketModel = mongoose.model("permissionTickets", permissionTicketSchema);

var resourceSchema = new mongoose.Schema({
  resource_id: String,
  resource_uri: String,
  user_id: String
})
var resourceModel = mongoose.model("resource", resourceSchema);

var policySchema = new mongoose.Schema({
  resource_id: String,
  owner_id: String,
  grant: [String]
})
var policyModel = mongoose.model('policy', policySchema);

var clientCredentialsSchema = new mongoose.Schema({
  client_id: String,
  secret: String
})

var clientCredentialsModel = mongoose.model("clientCredential", clientCredentialsSchema);

var rptSchema = new mongoose.Schema({
  rpt: String,
  active: Number,
  requesting_user_id: String,
  resource_id: String
})
var rptModel = mongoose.model("rpt", rptSchema);

/**
* CRUD Functions:
**/

exports.saveAuthToken = function(user, token, success) {
  oauthTokenModel.find({access_token: token.access_token}).remove(null);

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
      // error
    }
  })
}

exports.savePermissionTicket = function(ticket, success) {
  permissionTicketModel.find(ticket).remove().exec();
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

exports.findPermissionRequests = function(ticket, success) {
  permissionTicketModel.find(ticket, function(err, obj){
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
  newResource.resource_id = crypto.randomBytes(32).toString('hex');

  // Grant owner access to resource.
  exports.savePolicy({"owner_id": resource.user_id, "resource_id": newResource.resource_id, "grant": resource.user_id}, console.log);

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

exports.findScopeAndResourceByTicket = function(ticketId, success) {
  permissionTicketModel.findOne({"ticket": ticketId}, function(err, ticket){
    resourceModel.findOne({"resource_id": ticket.resource_set_id}, function(err, resource){
      ticket.owner_id = resource.user_id;
      success(ticket);
    })
  })
}

exports.savePolicy = function(policy, success) {
  rptModel.update({"resource_id": policy.resource_id}, { $set: {"active": 0}}).exec();
  if(policy.update == "add") {
    var updateQuery = { $push: { grant: policy.grant} };
    var selection   = {"resource_id": policy.resource_id};
    policyModel.findOneAndUpdate(selection, updateQuery, function(err, obj){ /* updated */   });

  }else if (policy.update == "remove") {

    var updateQuery = { $pull: { grant: policy.grant} };
    var selection   = {"resource_id": policy.resource_id};
    policyModel.findOneAndUpdate(selection, updateQuery, function(err, obj){ /* updated */    });

  }else {
    new policyModel(policy).save(function(e){
      success(policy);
    })
  }
}

exports.findPolicy = function(policy, success) {
  policyModel.findOne(policy, function(err, obj) {
    if(obj){
      success(obj);
    }
  })
}

exports.findPolicies = function(policy, success) {
  policyModel.find(policy, function(err, obj) {
    response = [];
      obj.forEach(function(entry){
        var index = entry.grant.indexOf(policy.owner_id);
        if(index > -1) {
          entry.grant.splice(index, 1);
          if(entry.grant.length > 0) {
            response.push(entry);
          }
        }
      })
      success(response);
  })
}

exports.addUserToPolicyGrant = function(policy, success) {
  policyModel.findOneAndUpdate({"owner_id": policy.owner_id, "resource_id": policy.resource_id}, policy,{upsert:true}, function(err, doc){
    success(policy);
  });
}

exports.findClientCredentials = function(client, success){
  exports.saveClientCredentials(client, console.log);
  clientCredentialsModel.findOne(client, function(err, obj){
    if(obj)
      success(obj);
  })
}

exports.saveClientCredentials = function(client, success) {
  new clientCredentialsModel(client).save(function (e) {
    success(client);
  })
}

exports.findRpt = function(rpt, success){
  rptModel.findOne(rpt, function(err, obj){
    if(obj)
      success(obj);
  })
}

exports.saveRpt = function(rpt, success) {
  rptModel.find({"resource_id": rpt.resource_id, "requesting_user_id" : rpt.requesting_user_id}).remove().exec();
  rpt.active = 1;
  new rptModel(rpt).save(function (e) {
    success(rpt);
  })
}
