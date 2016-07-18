var express       = require('express');
var auth          = require('./auth.js');
var status        = require('./errorHandling.js');
var db_functions  = require('../db_logic/db.js');
var crypto        = require("./crypto.js");
var ticketModel   = require("./ticket.js");
var resourceModel = require("./resource.js");
var rptModel      = require("./rpt.js");
var policy        = require("../model/policy.js");
var request       = require("request");
var router        = express.Router();


/* GET / */
router.get('/', function(req, res, next) {});
router.post('/', function(req, res) {});

/**
* TOKENS
**/

/* Request relying party token */
router.post("/rpt", function(req, res){
  req.body.access_token = req.headers.authorization;
  auth.userAuthorizedPost(res, req, status.denied, function(user) {
    ticketModel.validateExchangeModel(req.body, function(ticket) {
      policy.grantAccess(user, ticket, function(rpt){
        res.send({"rpt": rpt});
      })
    })
  })
});

/* Introspection endpoint for RPT tokens. (Validation checks) */
router.post("/introspect", function(req, res) {
  if(req.body.token == 403) {
    res.send("rejected");
  }
	req.body.access_token = req.headers.authorization;
	auth.clientAuthorizedPost(res, req, status.denied, function(client) {
		rptModel.validate(req.body, function(rpt) {
			res.send(rpt);
		})
	})
})

/* Request access_token (used by the resource server to gain access to the PAT - the protection API) */
router.post("/oauth/token", function(req, res) {
  auth.post(res, req, function(){
    res.sendStatus(403);
  }, function(token){
    res.send(token);
  }, auth.grantAccessToken)
})

/**
* TICKETS
**/

/* Register and receive permission ticket (for the client to exchange for an RTP token) */
router.post("/register/ticket", function(req, res){
  auth.post(res, req, status.denied, function(ticket) {
    ticketModel.validateModel(ticket, ticketModel.validateResourceSet, function(ticket){
      db_functions.savePermissionTicket(ticket, function(ticket){
        res.send({"ticket": ticket.ticket});
      })
    })
  })
})

router.get("/ticket/requests", function(req, res) {
  var response = [];

  req.body.access_token = req.headers.authorization;
  auth.userAuthorizedPost(res, req, status.denied, function(user) {
    db_functions.findResource({"user_id": user.user_id}, function(resources) {
      var rIds = [];
      var names = [];
      resources.forEach(function(r){
        rIds[r.resource_id] = r.resource_uri;
      })
      
      db_functions.findPermissionRequests({"resource_set_id": {$in: Object.keys(rIds)}}, function(tickets) {
        
        tickets.forEach(function(t) {
          if(t.user_id != user.user_id) {
            db_functions.findPolicy({"resource_id": t.resource_set_id}, function(policy){
              if(policy.grant.indexOf(t.user_id) == -1) {
                response.push({"requester": t.user_id, "resource": rIds[t.resource_set_id], "resource_id": t.resource_set_id, "scope": t.scope})
              }
            })
          }
        })

        setTimeout(function() {
            res.send(response);
        }, 1000);
      })
    })
  })
})

/**
* RESOURCES AND POLICIES
**/

/* Register resource to be put under UMA protection. */
router.post("/register/resource", function(req, res){
  req.body.access_token = req.headers.authorization;
  req.body.sessionID    = req.sessionID;
  
  auth.clientAuthorizedPost(res, req, status.denied, function(user) {
    resourceModel.validateModel({"user_id": req.body.user_id}, req.body, function(resource){
      
      db_functions.saveResource(resource, function(resource){
        res.send({"resource": resource});
      })
  
    })
  })
})

router.get("/resources", function(req, res) {
  req.body.access_token = req.headers.authorization;
  req.body.sessionID    = req.sessionID;

  auth.userAuthorizedPost(res, req, status.denied, function(user) {
    db_functions.findResource({"user_id": user.user_id}, function(resources){
      res.send({"resource": resources});
    })
  })
})


router.get("/policies", function(req, res) {
  req.body.access_token = req.headers.authorization;
  req.body.sessionID    = req.sessionID;

  auth.userAuthorizedPost(res, req, status.denied, function(user) {
    db_functions.findPolicies({"owner_id": user.user_id}, function(policies){
      res.send({"policies": policies})
    })
  })
})

/* Set protection policies on a resource */
router.post("/register/policy", function(req, res) {
  req.body.access_token = req.headers.authorization;
  req.body.sessionID    = req.sessionID;
  

  auth.userAuthorizedPost(res, req, status.denied, function(user){
    policy.validate(
      {
        "owner_id": user.user_id,
        "resource_id": req.body.resource_id, 
        "grant": req.body.grant,
        "update": req.body.update
     }
     , function(policy){
      db_functions.savePolicy(policy, function(policy){
        res.send(policy);
      })
    })
  })
})
module.exports = router;
