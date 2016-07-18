var db_functions = require("../db_logic/db.js");

exports.validateModel = function(ticket, success, next) {
  if(ticket.resource_set_id && ticket.scope && ticket.user_id) {
    success(ticket, next);
  }
}

exports.validateResourceSet = function(ticket, success) {
	db_functions.findResource({"resource_id": ticket.resource_set_id}, function(resource_id){
    success(ticket);
	})
}

exports.validateExchangeModel = function(ticket, success){
  if(ticket.ticket) {
    db_functions.findScopeAndResourceByTicket(ticket.ticket, function(ticket){
      success(ticket);
    })
  }
}
