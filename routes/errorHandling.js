exports.denied = function(res){
  res.sendStatus(403);
}

exports.ok = function(res){
  res.sendStatus(200);
}
