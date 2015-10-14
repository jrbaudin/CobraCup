var express = require('express');
//var momentDefault = require('moment');
var momentSWE = require('cloud/tools/moment-with-locales.min.js');
var momentTwitter = require('cloud/tools/moment-twitter.js');
var _ = require('underscore');

var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');
 
// Controller code in separate files.
var hubController = require('cloud/controllers/hub.js');
var singupController = require('cloud/controllers/signup.js');
var teamController = require('cloud/controllers/team.js');
var playerController = require('cloud/controllers/player.js');
var adminController = require('cloud/controllers/admin.js');
var statController = require('cloud/controllers/stat.js');

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
app.locals.moment = momentSWE;
app.locals.Mailgun = Mailgun;
 
app.locals.formatTime = function(time) {
  return momentSWE(time).locale('sv').format('dddd, MMMM D, YYYY');
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

app.locals.getFromNow = function(timestamp1) {
	var currentTime = momentSWE().locale('sv').zone('+0100');
	var published = momentSWE(timestamp1).locale('sv').zone('+0100');
	return published.from(currentTime);
};

app.locals.getFromNowStripped = function(timestamp2) {
	var currentTime = momentSWE().locale('sv').zone('+0100');
	var published = momentSWE(timestamp2).locale('sv').zone('+0100');
	return published.from(currentTime, true);
};

app.locals.getAge = function(birthday) {
	var years = momentSWE().diff(birthday, 'years');
	return years;
};

// Show homepage
app.get('/', hubController.index); 

app.get('/signup', singupController.new);
app.put('/signup', singupController.create);

app.get('/signup/rookie', singupController.rookie);
app.put('/signup/rookie', singupController.create);

app.get('/team/:teamid', teamController.getTeam);
//app.put('/team/:teamid', teamController.update);
//app.del('/team/:teamid', teamController.delete);

app.get('/player/:playerid', playerController.getPlayer);
app.get('/player/edit/:playerid', playerController.getPlayerForUpdate);
app.put('/player/edit/:playerid', playerController.updatePlayer);
//app.del('/player/:playerid', playerController.deletePlayer);

app.get('/stat/league', statController.showLeague);
app.get('/stat/divisions', statController.showDivisions);
app.get('/stat/playerstats', statController.showPlayerStats);

app.get('/stat/game/:gameid', statController.loadMatchReporter);
app.put('/stat/game/:gameid', statController.saveMatchResult);

app.get('/stat/history', statController.showHistory);

app.get('/games', statController.loadGames);
app.get('/games/group/:groupid', statController.loadGroupGames);

app.get('/admin/login', adminController.index);
app.post('/admin/login', adminController.login);

app.post('/admin/logout', adminController.logout);

app.get('/admin/tools', requireUser, adminController.tools);

app.get('/admin/match', adminController.loadMatchCreator);
app.put('/admin/match', adminController.createMatch);

app.get('/admin/push', adminController.loadPushCreator);
app.put('/admin/push', adminController.createPush);
 
app.get('/admin/final', adminController.loadFinalCreator);
app.put('/admin/final', adminController.createFinal);

app.get('/feed', statController.loadFeed);

app.use(function(request, response) {
  response.status(400);
  response.render('404');
});

// Required for initializing Express app in Cloud Code.
app.listen();