var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

var moment = require('moment');
var momentSWE = require('cloud/tools/moment-with-locales.min.js');
 
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
  teamQuery.ascending('group');
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(teams) {
    if (teams) {
      var Game = Parse.Object.extend('Game');
      var gameQuery = new Parse.Query(Game);
      gameQuery.ascending('round');
      gameQuery.find().then(function(games) {
        if (games) {
          res.render('creatematch', {
            teams: teams,
            games: games
          });
        } else {
          res.render('hub', {
            flash: 'Kunde int hitta na lag.'
          });
        }
      },
      function(error) {
        console.error("Problem när matcherna skulle hämtas...");
        console.error(error);
        res.send(500, 'Failed finding games');
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
  var genId = Math.floor((Math.random() * 100000) + 1);
  
  var GameResult = Parse.Object.extend("GameResult");
  var gameResult = new GameResult();

  gameResult.set('game_id', genId.toString());

  gameResult.set('home_goals', 0);
  gameResult.set('away_goals', 0);

  gameResult.set('home_captain_goals', 0);
  gameResult.set('home_captain_fights', 0);
  gameResult.set('home_lieutenant_goals', 0);
  gameResult.set('home_lieutenant_fights', 0);

  gameResult.set('away_captain_goals', 0);
  gameResult.set('away_captain_fights', 0);
  gameResult.set('away_lieutenant_goals', 0);
  gameResult.set('away_lieutenant_fights', 0);
  gameResult.save().then(function(saved_game_result) {
    var game_date = req.body.game_date;
    var game_time = req.body.game_time;

    var date = new Date(game_date + " " + game_time);

    var hometeam = req.body.hometeam;
    var awayteam = req.body.awayteam;
    var comment = req.body.comment;

    var round = req.body.round;
    var group = req.body.group;

    var Team = Parse.Object.extend("Team");

    var homeTeamObj = new Team();
    homeTeamObj.id = hometeam;

    var awayTeamObj = new Team();
    awayTeamObj.id = awayteam;

    var Game = Parse.Object.extend("Game");
    var game = new Game();

    game.set("result", saved_game_result);

    game.set("home", homeTeamObj);
    game.set("away", awayTeamObj);

    //game.set("home_goals", "0");
    //game.set("away_goals", "0");

    game.set("played", false);
    game.set("result_submitted", false);

    game.set("date", date);

    game.set("comment", comment);

    game.set("round", parseInt(round));
    game.set("group", parseInt(group));

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
            var Game = Parse.Object.extend('Game');
            var gameQuery = new Parse.Query(Game);
            gameQuery.ascending('round');
            gameQuery.find().then(function(games) {
              if (games) {
                res.render('creatematch', {
                  teams: teams,
                  games: games
                });
              } else {
                res.render('hub', {
                  flash: 'Kunde int hitta na lag.'
                });
              }
            },
            function(error) {
              console.error("Problem när matcherna skulle hämtas...");
              console.error(error);
              res.send(500, 'Failed finding games');
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
  }, function(error) {
    // Show the error message and let the user try again
    console.error('Error saving the empty game result, try again.');
    console.error(error);
    res.render('creatematch', {flash: error.message});
  });
};


exports.loadFinalCreator = function(req, res) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.equalTo('qualified', true);
  teamQuery.ascending('team_name');
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(teams) {
    if (teams) {
      var Finals = Parse.Object.extend('Finals');
      var finalGameQuery = new Parse.Query(Finals);
      finalGameQuery.descending('date');
      finalGameQuery.find().then(function(finals) {
        if (finals) {
          res.render('createfinal', {
            teams: teams,
            finals: finals
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
exports.createFinal = function(req, res) {
  var game_date = req.body.game_date;
  var game_time = req.body.game_time;

  var date = new Date(game_date + " " + game_time);

  var hometeam = req.body.hometeam;
  var awayteam = req.body.awayteam;
  var comment = req.body.comment;

  var round = req.body.round;

  var Team = Parse.Object.extend("Team");

  var homeTeamObj = new Team();
  homeTeamObj.id = hometeam;

  var awayTeamObj = new Team();
  awayTeamObj.id = awayteam;

  var Finals = Parse.Object.extend("Finals");
  var finalGame = new Finals();

  finalGame.set("home", homeTeamObj);
  finalGame.set("away", awayTeamObj);

  finalGame.set("home_goals", parseInt("0"));
  finalGame.set("away_goals", parseInt("0"));

  finalGame.set("played", false);

  finalGame.set("date", date);

  finalGame.set("comment", comment);

  finalGame.set("round", parseInt(round));

  var genId = Math.floor((Math.random() * 100000) + 1);
  finalGame.set('game_id', genId.toString());

  finalGame.save().then(function(saved_game) {
    if (saved_game) {
      var passedInfoVariable = "Matchen med id: " + saved_game.get("game_id") + " är nu sparad!";
      var Team = Parse.Object.extend('Team');
      var teamQuery = new Parse.Query(Team);
      teamQuery.descending('createdAt');
      teamQuery.include('nhlTeam');
      teamQuery.find().then(function(teams) {
        if (teams) {
          var Finals = Parse.Object.extend('Finals');
          var finalGameQuery = new Parse.Query(Finals);
          finalGameQuery.descending('date');
          finalGameQuery.find().then(function(finals) {
            if (finals) {
              res.render('createfinal', {
                teams: teams,
                finals: finals
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

exports.loadPushCreator = function(req, res) {
  res.render('push', {});
};

// Create a new team with specified information.
exports.createPush = function(req, res) {
  var push_header = req.body.push_header;
  var push_message = req.body.push_message;
  var push_link = req.body.push_link;

  if (_.isEmpty(push_link)) {
    push_link = "#"
  }

  var currentTime = momentSWE(new Date()).locale('sv').format('YYYY-MM-DD HH:mm:ss');
  var published = new Date(currentTime);

  var Notification = Parse.Object.extend("Notification");
  var note = new Notification();
  note.set('header', push_header);
  note.set('message', push_message);
  note.set('published', published);
  note.set('link', push_link);
  note.save().then(function(saved_note) {
    if (saved_note) {
      console.log("Successfully saved new Notification");
      res.redirect('/feed');
    } else {
      console.error("Failed saving Notification");
      res.render('push', {
        flash: "Failed saving Notification"
      });
    }    
  }, function(error) {
    console.error("Failed saving Notification");
    console.error(error);
    res.render('push', {
      flash: error.message
    });
  });
};