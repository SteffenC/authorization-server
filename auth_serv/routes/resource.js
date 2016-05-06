exports.validateModel = function(resource, success, next) {
  if(resource.resource_uri) {
    console.log("1: validated!");
    success(resource);
  }
}