exports.validateModel = function(user, resource, success, next) {
  if(resource.resource_uri && user.user_id) {
    console.log("1: validated!");
    resource.user_id = user.user_id;
    success(resource);
  }
}
