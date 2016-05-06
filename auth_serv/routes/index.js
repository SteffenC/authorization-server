var express       = require('express');
var auth          = require('./auth.js');
var status        = require('./errorHandling.js');
var db_functions  = require('../db_logic/db.js');
var crypto        = require("./crypto.js");
var ticketModel   = require("./ticket.js");
var resourceModel = require("./resource.js");
var router        = express.Router();


/* GET / */
router.get('/', function(req, res, next) {});
router.post('/', function(req, res) {});

/**
* TOKENS
**/

/* Request relying party token */
router.post("/rpt", function(req, res){

});

/* Register and recieve permission ticket (for the client to exchange for an RTP token) */
router.post("/register/permission", function(req, res){
  auth.post(res, req, status.denied, function(ticket) {
    ticketModel.validateModel(ticket, ticketModel.validateResourceSet, function(ticket){
      console.log("Ticket model VALIDATED");
      db_functions.savePermissionTicket(ticket, function(ticket){
        res.send({"ticket": ticket.ticket});
      })
    })
  })
})


/* Register resource to be put under UMA protection. */
router.post("/register/resource", function(req, res){
  auth.userAuthorizedPost(res, req, status.denied, function(user) {
    resourceModel.validateModel(req.body, function(resource){
      
      console.log("Resource model VALIDATED");
      db_functions.saveResource(resource, function(resource){
        res.send({"resource": resource});
      })

    })
  })
})
module.exports = router;
