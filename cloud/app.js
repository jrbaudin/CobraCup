var express = require('express');
var moment = require('moment');
var _ = require('underscore');

var Mailgun = require('mailgun');
Mailgun.initialize('mg.skipool.nu', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

var parseExpressHttpsRedirect = require('parse-express-https-redirect');
 
// Controller code in separate files.
var singupController = require('cloud/controllers/signup.js');
 
// Required for initializing Express app in Cloud Code.
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');  // Switch to Jade by replacing ejs with jade here.
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(parseExpressHttpsRedirect());    // Automatically redirect non-secure urls to secure ones

app.use(function(req, res, next) {
  Parse.Cloud.run('getConfig', {}, {
    success: function(cfgObj) {
      res.locals.cfg_obj = cfgObj.attributes;
      next();
    },
    error: function(error) {
      console.error('CALLING FUNC There was an error.. damn! ' + error);
      res.locals.cfg_obj = {"error":"No config was fetched.. fix it"};
      next();
    }
  });
});
 
// You can use app.locals to store helper methods so that they are accessible
// from templates.
app.locals._ = _;
app.locals.moment = moment;
app.locals.Mailgun = Mailgun;
 
app.locals.formatTime = function(time) {
  return moment(time).locale('sv').format('LLLL');
};
 
// Show homepage
 
app.get('/', singupController.index);
app.put('/', singupController.signup);
app.del('/:objectId', singupController.delete);
 
// Required for initializing Express app in Cloud Code.
app.listen();