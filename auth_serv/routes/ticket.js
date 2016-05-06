var db_functions = require("../db_logic/db.js");

exports.validateModel = function(ticket, success, next) {
  console.log(ticket.resource_set_id);
  if(ticket.resource_set_id && ticket.scope) {
    console.log("1: validated!");      
    success(ticket, next);
  }
}

exports.validateResourceSet = function(ticket, success) {
	db_functions.findResource({"resource_id": ticket.resource_set_id}, function(){
		console.log("2: validated!");
    success(ticket);
	})
}