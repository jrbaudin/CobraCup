var express = require('express');
var moment = require('moment');
var _ = require('underscore');

var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');
 
// Controller code in separate files.
var hubController = require('cloud/controllers/hub.js');
var singupController = require('cloud/controllers/signup.js');
var teamController = require('cloud/controllers/team.js');
 
// Required for initializing Express app in Cloud Code.
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');  // Switch to Jade by replacing ejs with jade here.
app.use(express.bodyParser());
app.use(express.methodOverride());
 
// You can use app.locals to store helper methods so that they are accessible from templates.
app.locals._ = _;
app.locals.moment = moment;
app.locals.Mailgun = Mailgun;
 
app.locals.formatTime = function(time) {
  return moment(time).locale('sv').format('LLLL');
};
 
// Show homepage
app.get('/', hubController.index); 

app.get('/signup', singupController.new);
app.put('/signup', singupController.create);

app.get('/team/:teamid', teamController.getTeam);
app.put('/team/:teamid', teamController.update);
app.del('/team/:teamid', teamController.delete);
 
// Required for initializing Express app in Cloud Code.
app.listen();