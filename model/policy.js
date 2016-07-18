var db_functions = require('../db_logic/db.js');
var crypto = require('crypto');

exports.grantAccess = function(user, searchTicket, success) {
  db_functions.findPolicy({"resource_id": searchTicket.resource_set_id}, function(ticket){
		arrayContains(user.user_id, ticket.grant, function(granted){
				if(granted){
				  db_functions.saveRpt({"resource_id": ticket.resource_id, "requesting_user_id": user.user_id, "rpt": crypto.randomBytes(32).toString('hex')}, 
  				  function(rpt){
  				    success(rpt.rpt);				    
  				  }
				  )
				}else {
				  success(403);
				}
			}
		)
	})
}

exports.validate = function(policy, success) {
  if(policy.owner_id && policy.grant && policy.resource_id) {
    db_functions.findResource({"resource_id": policy.resource_id}, function(resource){
      if(resource[0].user_id == policy.owner_id) {
        success(policy); 
      }
    })
  }
}

function arrayContains(needle, haystack, success){
	success(haystack.indexOf(needle) > -1 || haystack.indexOf("*") > -1);
}
