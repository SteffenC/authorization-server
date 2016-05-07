var db_functions = require("../db_logic/db.js");

exports.validateModel = function(ticket, success, next) {
  console.log("0: " + JSON.stringify(ticket));
  if(ticket.resource_set_id && ticket.scope) {
    console.log("1: validated!");
    success(ticket, next);
  }
}

exports.validateResourceSet = function(ticket, success) {
  console.log("Searching for : " + ticket.resource_set_id)
	db_functions.findResource({"resource_id": ticket.resource_set_id}, function(resource_id){
    success(ticket);
	})
}

exports.validateExchangeModel = function(ticket, success){
  if(ticket.ticket) {
    success(ticket);
  }
}
