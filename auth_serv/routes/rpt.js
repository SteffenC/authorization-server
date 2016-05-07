exports.validateModel = function(ticket, success, next) {
  if(ticket.ticket) {
    success(ticket);
  }
}
