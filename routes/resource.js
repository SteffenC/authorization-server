exports.validateModel = function(user, resource, success, next) {
  if(resource.resource_uri && user.user_id) {
    resource.user_id = user.user_id;
    success(resource);
  }
}
