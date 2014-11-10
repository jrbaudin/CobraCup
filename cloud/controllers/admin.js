var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');
 
exports.index = function(req, res) {
  res.render('login');
};
 
exports.login = function(req, res) {
  Parse.User.logIn(req.body.username, req.body.password).then(function(user) {
    if(user){
      res.render('tools', { 
        loggedInUser: user
      });
    } else {
      res.render('tools', { 
        flash: "Problem att skicka user objektet vidare."
      });
    }
  }, function(error) {
    // Show the error message and let the user try again
    res.render('login', { flash: error.message });
  });
};
 
exports.logout = function(req, res) {
  Parse.User.logOut();
  res.redirect('/');
};
 
exports.tools = function(req, res) {
  res.render('tools', { 
    flash: "Problem att skicka user objektet vidare."
  });
};