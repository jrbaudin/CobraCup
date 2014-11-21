var express = require('express');
var moment = require('moment');
var _ = require('underscore');

var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');
 
// Controller code in separate files.
var hubController = require('cloud/controllers/hub.js');
var singupController = require('cloud/controllers/signup.js');
var teamController = require('cloud/controllers/team.js');
var adminController = require('cloud/controllers/admin.js');

var requireUser = require('cloud/require-user');
 
// Required for initializing Express app in Cloud Code.
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use(express.methodOverride());
 
// You can use app.locals to store helper methods so that they are accessible from templates.
app.locals._ = _;
app.locals.moment = moment;
app.locals.Mailgun = Mailgun;
 
app.locals.formatTime = function(time) {
  return moment(time).locale('sv').format('LLLL');
};

app.locals.formatDateAndTime = function(time6) {
  return momentSWE(time6).locale('sv').format('dddd, MMMM D, YYYY, HH:mm');
};

app.locals.justTime = function(time2) {
  return momentSWE(time2).locale('sv').format('HH:mm');
};

app.locals.getDate = function(time3) {
  return momentSWE(time3).format('L');
};

app.locals.getDayText = function(time4) {
  return momentSWE(time4).locale('sv').format('ddd');
};

app.locals.getDayAndDateText = function(time5) {
  return momentSWE(time5).locale('sv').format('ddd, D/MM');
};

app.locals.getFirstname = function(fullname) {
	var aName = fullname.split(' ');
	return _.first(aName);
};
 
// Show homepage
app.get('/', hubController.index); 

app.get('/signup', singupController.new);
app.put('/signup', singupController.create);

app.get('/team/:teamid', teamController.getTeam);
app.put('/team/:teamid', teamController.update);
app.del('/team/:teamid', teamController.delete);

app.get('/admin/login', adminController.index);
app.post('/admin/login', adminController.login);

app.post('/admin/logout', adminController.logout);

app.get('/admin/tools', requireUser, adminController.tools);
 
// Required for initializing Express app in Cloud Code.
app.listen();