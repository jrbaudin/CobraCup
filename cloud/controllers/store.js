var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

var _ = require('underscore');

exports.load = function(request, response) {
  var msgError = request.query.error;
  var msgWarning = request.query.warning;
  var msgInfo = request.query.info;

  response.render('order-tshirt', {
    flashError: msgError,
    flashWarning: msgWarning,
    flashInfo: msgInfo
  });
  
};

exports.placeOrder = function(request, response) {

  var email = "";
  var telephone = "";
  var name = "";
  var size = "";
  var price = "";
  var type = "";

  if ((typeof(request.body.telephone) !== 'undefined') && (!_.isEmpty(request.body.telephone))) {
    telephone = request.body.telephone;
  }
  if ((typeof(request.body.email) !== 'undefined') && (!_.isEmpty(request.body.email))) {
    email = request.body.email;
  }
  if ((typeof(request.body.name) !== 'undefined') && (!_.isEmpty(request.body.name))) {
    name = request.body.name;
  }
  if ((typeof(request.body.size) !== 'undefined') && (!_.isEmpty(request.body.size))) {
    size = request.body.size;
  }
  if ((typeof(request.body.type) !== 'undefined') && (!_.isEmpty(request.body.type))) {
    type = request.body.type;
  }
  if ((typeof(request.body.price) !== 'undefined') && (!_.isEmpty(request.body.price))) {
    price = request.body.price;
  }

  Parse.Cloud.run('placeOrder', { 
    telephone: telephone,
    email: email,
    name: name,
    size: size,
    type: type,
    price: price }, {
    success: function(result) {
      //response.json(result);
      var info_msg = encodeURIComponent('Din beställning är nu inskickad. Vänligen följ instruktionerna för betalning i mejlet så snart som möjligt. Tack!');
      response.redirect('/order/' + '?info=' + info_msg);
    },
    error: function(error) {
      alert(error);

      var error_msg = encodeURIComponent('Problem uppstod när din beställning skulle göras. Vänligen försök igen! Meddelande: ' + error);
      response.redirect('/order/' + '?error=' + error_msg);

      //response.send(500, 'Failed placing the order. Error msg: ' + error);
    }
  });
};