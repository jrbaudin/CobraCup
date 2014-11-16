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

exports.loadMatchCreator = function(req, res) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.ascending('team_name');
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(teams) {
    if (teams) {
      res.render('creatematch', {
        teams: teams
      });
    } else {
      res.render('hub', {
        flash: 'Kunde int hitta na lag.'
      });
    }
  },
  function(error) {
    console.error("Problem när lagen skulle hämtas...");
    console.error(error);
    res.send(500, 'Failed finding teams');
  });
};

// Create a new team with specified information.
exports.createMatch = function(req, res) {
  var game_date = req.body.game_date;
  var game_time = req.body.game_time;

  var date = new Date(game_date + " " + game_time);

  var hometeam = req.body.hometeam;
  var awayteam = req.body.awayteam;
  var comment = req.body.comment;

  var Team = Parse.Object.extend("Team");

  var homeTeamObj = new Team();
  homeTeamObj.id = hometeam;

  var awayTeamObj = new Team();
  awayTeamObj.id = awayteam;

  var Game = Parse.Object.extend("Game");
  var game = new Game();

  game.set("home", homeTeamObj);
  game.set("away", awayTeamObj);

  game.set("home_goals", "0");
  game.set("away_goals", "0");

  game.set("played", false);

  game.set("date", date);

  game.set("comment", comment);

  var genId = Math.floor((Math.random() * 100000) + 1);
  game.set('game_id', genId.toString());

  game.save().then(function(saved_game) {
    if (saved_game) {
      var passedInfoVariable = "Matchen med id: " + saved_game.get("game_id") + " är nu sparad!";
      var Team = Parse.Object.extend('Team');
      var teamQuery = new Parse.Query(Team);
      teamQuery.descending('createdAt');
      teamQuery.include('nhlTeam');
      teamQuery.find().then(function(teams) {
        if (teams) {
          var count = _.size(teams);
          res.render('hub', {
            teams: teams,
            count: count,
            flashInfo: passedInfoVariable
          });
        } else {
          res.render('hub', {flash: 'Inga lag är ännu registrerade.'});
        }
      },
      function(error) {
        console.error('Error find teams to send to The Hub');
        console.error(error);
        res.render('hub', {flash: 'Problem när de anmälda lagen skulle hämtas.'});
      });
    } else {
      console.error('The Game object was undefined.');
      res.render('creatematch', {flash: "Det var problem på sidan. Pröva kontakta en administratör."});
    }
  }, function(error) {
    // Show the error message and let the user try again
    console.error('Error saving the new game, try again.');
    console.error(error);
    res.render('creatematch', {flash: error.message});
  });
};