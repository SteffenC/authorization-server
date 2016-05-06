var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/production');

var apiTokenSchema = new mongoose.Schema({
  title: String
})

var itemModel = mongoose.model("apiTokens", apiTokenSchema);


exports.assignToken = function(req, callback) {
  var ua = req.get('User-Agent');
}
