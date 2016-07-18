var db_functions = require('../db_logic/db.js');

exports.validate = function(body, success, next) {
  if(body.rpt) {
  	db_functions.findRpt({"rpt": body.rpt}, function(rpt){
  	  if(rpt.requesting_user_id == body.requesting_user_id) {
  	    success(rpt);  
  	  }
  	})
  }else if(body.token) {
  	db_functions.findRpt({"rpt": body.token}, function(rpt){
    	if(rpt.requesting_user_id == body.requesting_user_id) {
  	    success(rpt);  
  	  }
  	})
  } 
}
