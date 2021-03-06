var _ = require('underscore');
var moment = require('moment');
var momentSWE = require('cloud/tools/moment-with-locales.min.js');

exports.showHistory = function(request, response) {
  var resGF;
  var resWins;
  var resPOWins;

  Parse.Cloud.run('getTeams', {}).then(function(results){
    resGF = _.sortBy(results, function(result){
                        var stats = result.get("stats");
                        var gf = 0;
                        _.each(stats.seasons, function(season) {
                          gf = gf+season.gf;
                        });
                        return gf; 
                      });
    resGF = resGF.reverse();

    resWins = _.sortBy(results, function(result){
                        var stats = result.get("stats");
                        var gp = 0;
                        _.each(stats.seasons, function(season) {
                          gp = gp+season.gp;
                        });
                        return gp; 
                      });
    
    resWins = _.sortBy(resWins, function(result){
                        var stats = result.get("stats");
                        var wins = 0;
                        _.each(stats.seasons, function(season) {
                          wins = wins+season.wins;
                        });
                        return wins; 
                      });
    resWins = resWins.reverse();

    resPOWins = _.sortBy(results, function(result){
                        var stats = result.get("stats");
                        var gp = 0;
                        _.each(stats.seasons, function(season) {
                            if ((typeof(season.playoffs) !== 'undefined') && (season.playoffs.gp > 0)) {
                              gp = gp+season.playoffs.gp;
                            }
                        });
                        return gp; 
                      });

    resPOWins = _.sortBy(resPOWins, function(result){
                        var stats = result.get("stats");
                        var wins = 0;
                        _.each(stats.seasons, function(season) {
                            if ((typeof(season.playoffs) !== 'undefined') && (season.playoffs.gp > 0)) {
                              wins = wins+season.playoffs.wins;
                            }
                        });
                        return wins; 
                      });
    resPOWins = resPOWins.reverse();

    return Parse.Cloud.run('getPlayers', {});
  }).then(function(results){

    var playerGoals = _.sortBy(results, function(result){
                        var stats = result.get("stats");
                        var gp = 0;
                        _.each(stats.seasons, function(season) {
                          gp = gp+season.gp;
                        });
                        return gp; 
                      });

    var playerGoals = _.sortBy(playerGoals, function(result){
                        var stats = result.get("stats");
                        var goals = 0;
                        _.each(stats.seasons, function(season) {
                          goals = goals+season.goals;
                        });
                        return goals; 
                      });
    playerGoals = playerGoals.reverse();
    
    var playerFights = _.sortBy(results, function(result){
                        var stats = result.get("stats");
                        var gp = 0;
                        _.each(stats.seasons, function(season) {
                          gp = gp+season.gp;
                        });
                        return gp; 
                      });

    var playerFights = _.sortBy(playerFights, function(result){
                        var stats = result.get("stats");
                        var fights = 0;
                        _.each(stats.seasons, function(season) {
                          fights = fights+season.fights;
                        });
                        return fights; 
                      });
    playerFights = playerFights.reverse();

    response.render('stats-history', {
      teamsGF: resGF,
      teamsWins: resWins,
      teamsPOWins: resPOWins,
      playerGoals: playerGoals,
      playerFights: playerFights
    });

  }, function(error){
    alert(error);
    response.send(500, 'Failed getting sorted Teams list');
  });
};

exports.showLeague = function(req, res) {
  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.descending('points,goals_for,difference,games_played');
  standingsQuery.include(["team.nhlTeam"]);
  standingsQuery.find().then(function(standings) {
    if (standings) {
      console.log("Gotten the standings...");
      res.render('league', {
        standings: standings
      });
    } else {
      console.error('Problem when trying to get team standings, could not get any');
      res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
    }
  },
  function(error){
    console.error('Error when trying to get team standings');
    console.error(error);
    res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
  });
};

exports.showDivisions = function(req, res) {
  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.descending('points,difference,goals_for');
  standingsQuery.include(["team.nhlTeam"]);
  standingsQuery.find().then(function(standings) {
    if (standings) {
      console.log("Gotten the standings...");
      res.render('divisions', {
        standings: standings
      });
    } else {
      console.error('Problem when trying to get team standings, could not get any');
      res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
    }
  },
  function(error){
    console.error('Error when trying to get team standings');
    console.error(error);
    res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
  });
};

exports.showPlayerStats = function(request, response) {
  var objPlayers;
  var objStandings;

  var Player = Parse.Object.extend('Player');
  var playersQuery = new Parse.Query(Player);
  playersQuery.descending('goals');
  playersQuery.include("team.nhlTeam");
  playersQuery.find().then(function(players) {
    objPlayers = players;

    var Standings = Parse.Object.extend('Standings');
    var standingsQuery = new Parse.Query(Standings);

    return standingsQuery.find();

  }).then(function(standings){
    objStandings = standings;

    response.render('playerstats', {
      players: objPlayers,
      standings: objStandings
    });

  }, function(error){
    alert(error);
    response.error("Getting Player Stats data failed with error.code " + error.code + " error.message " + error.message);
    response.render('playerstats', {
      flashError: ('Problem när den önskade datan skulle hämtas: ' + error.message)
    });
  });
};

exports.loadMatchReporter = function(request, response) {
  var passedErrorVariable = request.query.error;
  var passedInfoVariable = request.query.info;

  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  gameQuery.equalTo('game_id', request.params.gameid);
  gameQuery.include(['home.nhlTeam','away.nhlTeam']);
  gameQuery.include(['home.captain','home.lieutenant']);
  gameQuery.include(['away.captain','away.lieutenant']);
  gameQuery.find().then(function(game) {
    response.render('reporter', {
      game: game,
      flashError: passedErrorVariable,
      flashInfo: passedInfoVariable
    });
  }, function(error){
    var error_msg = "Problem när den önskade matchen med id '" + request.params.gameid + "' skulle hämtas. Sannolikt finns det ingen match med det id't";
    console.log("Getting Game with id '" + request.params.gameid + "' failed with error.code " + error.code + " error.message " + error.message);
    response.render('reporter', {
      flashError: error_msg
    });

    /*
    if((typeof(error.code) !== 'undefined') || (typeof(error.message) !== 'undefined')){
      console.log("Getting Game with id '" + request.params.gameid + "' failed with error.code " + error.code + " error.message " + error.message);
    } else {
      console.log("Getting Game with id '" + request.params.gameid + "' failed with error.message: " + error);
    }

    if (_.isEqual(error, 404)) {
      response.status(404);
      response.render('404');
    } else {
      response.status(500).send({ error: error });
    }
    */

  });
};

/**
exports.loadMatchReporter = function(req, res) {
  var passedErrorVariable = req.query.error;

  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  gameQuery.equalTo('game_id', req.params.gameid);
  gameQuery.include(['home.nhlTeam','away.nhlTeam']);
  gameQuery.include(['home.captain','home.lieutenant']);
  gameQuery.include(['away.captain','away.lieutenant']);
  gameQuery.find().then(function(game) {
    if (game) {
      console.log("Gotten the game...");
      var Team = Parse.Object.extend('Team');
      var allTeamsQuery = new Parse.Query(Team);
      allTeamsQuery.descending('team_name');
      allTeamsQuery.include('nhlTeam');
      allTeamsQuery.find().then(function(teams) {
        if (teams) {
          res.render('reporter', {
            game: game,
            teams: teams,
            flashErrorGame: passedErrorVariable
          });
        } else {
          res.render('reporter', {
            flashError: "Kunde inte ladda match. Försök igen"
          });
        }
      },
      function(error) {
        console.error('Error when trying to get all teams');
        console.error(error);
        res.render('reporter', {
          flashError: "Kunde inte ladda match. Försök igen"
        });
      });
    } else {
      res.render('reporter', {
        flashError: "Kunde inte ladda match. Försök igen"
      });
    }
  },
  function(error){
    console.error('Error when trying to find game to report');
    console.error(error);
    res.render('reporter', {flashError: 'Problem när den önskade matchen skulle hämtas'});
  });
};
**/

exports.saveMatchResult = function(request, response) {
  var game_id = request.params.gameid;

  /** HOME **/
  var home_shots_p1 = 0;
  var home_shots_p2 = 0;
  var home_shots_p3 = 0;
  var home_shots_ot = 0;

  var home_faceoffs_p1 = 0;
  var home_faceoffs_p2 = 0;
  var home_faceoffs_p3 = 0;
  var home_faceoffs_ot = 0;

  var home_captain_fights = 0;

  var home_captain_goals_p1 = 0;
  var home_captain_goals_p2 = 0;
  var home_captain_goals_p3 = 0;
  var home_captain_goals_ot = 0;

  var home_captain_assists_p1 = 0;
  var home_captain_assists_p2 = 0;
  var home_captain_assists_p3 = 0;
  var home_captain_assists_ot = 0;

  var home_lieutenant_fights = 0;
  
  var home_lieutenant_goals_p1 = 0;
  var home_lieutenant_goals_p2 = 0;
  var home_lieutenant_goals_p3 = 0;
  var home_lieutenant_goals_ot = 0;

  var home_lieutenant_assists_p1 = 0;
  var home_lieutenant_assists_p2 = 0;
  var home_lieutenant_assists_p3 = 0;
  var home_lieutenant_assists_ot = 0;
  
  /** AWAY **/
  var away_shots_p1 = 0;
  var away_shots_p2 = 0;
  var away_shots_p3 = 0;
  var away_shots_ot = 0;

  var away_faceoffs_p1 = 0;
  var away_faceoffs_p2 = 0;
  var away_faceoffs_p3 = 0;
  var away_faceoffs_ot = 0;

  var away_captain_fights = 0;

  var away_captain_goals_p1 = 0;
  var away_captain_goals_p2 = 0;
  var away_captain_goals_p3 = 0;
  var away_captain_goals_ot = 0;

  var away_captain_assists_p1 = 0;
  var away_captain_assists_p2 = 0;
  var away_captain_assists_p3 = 0;
  var away_captain_assists_ot = 0;

  var away_lieutenant_fights = 0;

  var away_lieutenant_goals_p1 = 0;
  var away_lieutenant_goals_p2 = 0;
  var away_lieutenant_goals_p3 = 0;
  var away_lieutenant_goals_ot = 0;

  var away_lieutenant_assists_p1 = 0;
  var away_lieutenant_assists_p2 = 0;
  var away_lieutenant_assists_p3 = 0;
  var away_lieutenant_assists_ot = 0;

  /** GLOBAL **/
  var overtime = false;

  /** HOME TEAM **/
  if ((typeof(request.body.home_shots_p1) !== 'undefined') && (!_.isEmpty(request.body.home_shots_p1))) {
    home_shots_p1 = request.body.home_shots_p1;
  }
  if ((typeof(request.body.home_shots_p2) !== 'undefined') && (!_.isEmpty(request.body.home_shots_p2))) {
    home_shots_p2 = request.body.home_shots_p2;
  }
  if ((typeof(request.body.home_shots_p3) !== 'undefined') && (!_.isEmpty(request.body.home_shots_p3))) {
    home_shots_p3 = request.body.home_shots_p3;
  }
  if ((typeof(request.body.home_shots_ot) !== 'undefined') && (!_.isEmpty(request.body.home_shots_ot))) {
    home_shots_ot = request.body.home_shots_ot;
  }

  if ((typeof(request.body.home_faceoffs_p1) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_p1))) {
    home_faceoffs_p1 = request.body.home_faceoffs_p1;
  }
  if ((typeof(request.body.home_faceoffs_p2) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_p2))) {
    home_faceoffs_p2 = request.body.home_faceoffs_p2;
  }
  if ((typeof(request.body.home_faceoffs_p3) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_p3))) {
    home_faceoffs_p3 = request.body.home_faceoffs_p3;
  }
  if ((typeof(request.body.home_faceoffs_ot) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_ot))) {
    home_faceoffs_ot = request.body.home_faceoffs_ot;
  }

  /** HOME CAPTAIN **/
  if ((typeof(request.body.home_captain_fights) !== 'undefined') && (!_.isEmpty(request.body.home_captain_fights))) {
    home_captain_fights = request.body.home_captain_fights;
  }

  if ((typeof(request.body.home_captain_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_p1))) {
    home_captain_goals_p1 = request.body.home_captain_goals_p1;
  }
  if ((typeof(request.body.home_captain_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_p2))) {
    home_captain_goals_p2 = request.body.home_captain_goals_p2;
  }
  if ((typeof(request.body.home_captain_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_p3))) {
    home_captain_goals_p3 = request.body.home_captain_goals_p3;
  }
  if ((typeof(request.body.home_captain_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_ot))) {
    home_captain_goals_ot = request.body.home_captain_goals_ot;
  }

  if ((typeof(request.body.home_captain_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_p1))) {
    home_captain_assists_p1 = request.body.home_captain_assists_p1;
  }
  if ((typeof(request.body.home_captain_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_p2))) {
    home_captain_assists_p2 = request.body.home_captain_assists_p2;
  }
  if ((typeof(request.body.home_captain_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_p3))) {
    home_captain_assists_p3 = request.body.home_captain_assists_p3;
  }
  if ((typeof(request.body.home_captain_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_ot))) {
    home_captain_assists_ot = request.body.home_captain_assists_ot;
  }

  /** HOME LIEUTENANT **/
  if ((typeof(request.body.home_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_fights))) {
    home_lieutenant_fights = request.body.home_lieutenant_fights;
  }

  if ((typeof(request.body.home_lieutenant_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_p1))) {
    home_lieutenant_goals_p1 = request.body.home_lieutenant_goals_p1;
  }
  if ((typeof(request.body.home_lieutenant_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_p2))) {
    home_lieutenant_goals_p2 = request.body.home_lieutenant_goals_p2;
  }
  if ((typeof(request.body.home_lieutenant_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_p3))) {
    home_lieutenant_goals_p3 = request.body.home_lieutenant_goals_p3;
  }
  if ((typeof(request.body.home_lieutenant_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_ot))) {
    home_lieutenant_goals_ot = request.body.home_lieutenant_goals_ot;
  }

  if ((typeof(request.body.home_lieutenant_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_p1))) {
    home_lieutenant_assists_p1 = request.body.home_lieutenant_assists_p1;
  }
  if ((typeof(request.body.home_lieutenant_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_p2))) {
    home_lieutenant_assists_p2 = request.body.home_lieutenant_assists_p2;
  }
  if ((typeof(request.body.home_lieutenant_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_p3))) {
    home_lieutenant_assists_p3 = request.body.home_lieutenant_assists_p3;
  }
  if ((typeof(request.body.home_lieutenant_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_ot))) {
    home_lieutenant_assists_ot = request.body.home_lieutenant_assists_ot;
  }

   /** AWAY TEAM **/
  if ((typeof(request.body.away_shots_p1) !== 'undefined') && (!_.isEmpty(request.body.away_shots_p1))) {
    away_shots_p1 = request.body.away_shots_p1;
  }
  if ((typeof(request.body.away_shots_p2) !== 'undefined') && (!_.isEmpty(request.body.away_shots_p2))) {
    away_shots_p2 = request.body.away_shots_p2;
  }
  if ((typeof(request.body.away_shots_p3) !== 'undefined') && (!_.isEmpty(request.body.away_shots_p3))) {
    away_shots_p3 = request.body.away_shots_p3;
  }
  if ((typeof(request.body.away_shots_ot) !== 'undefined') && (!_.isEmpty(request.body.away_shots_ot))) {
    away_shots_ot = request.body.away_shots_ot;
  }

  if ((typeof(request.body.away_faceoffs_p1) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_p1))) {
    away_faceoffs_p1 = request.body.away_faceoffs_p1;
  }
  if ((typeof(request.body.away_faceoffs_p2) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_p2))) {
    away_faceoffs_p2 = request.body.away_faceoffs_p2;
  }
  if ((typeof(request.body.away_faceoffs_p3) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_p3))) {
    away_faceoffs_p3 = request.body.away_faceoffs_p3;
  }
  if ((typeof(request.body.away_faceoffs_ot) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_ot))) {
    away_faceoffs_ot = request.body.away_faceoffs_ot;
  }

  /** AWAY CAPTAIN **/
  if ((typeof(request.body.away_captain_fights) !== 'undefined') && (!_.isEmpty(request.body.away_captain_fights))) {
    away_captain_fights = request.body.away_captain_fights;
  }

  if ((typeof(request.body.away_captain_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_p1))) {
    away_captain_goals_p1 = request.body.away_captain_goals_p1;
  }
  if ((typeof(request.body.away_captain_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_p2))) {
    away_captain_goals_p2 = request.body.away_captain_goals_p2;
  }
  if ((typeof(request.body.away_captain_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_p3))) {
    away_captain_goals_p3 = request.body.away_captain_goals_p3;
  }
  if ((typeof(request.body.away_captain_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_ot))) {
    away_captain_goals_ot = request.body.away_captain_goals_ot;
  }

  if ((typeof(request.body.away_captain_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_p1))) {
    away_captain_assists_p1 = request.body.away_captain_assists_p1;
  }
  if ((typeof(request.body.away_captain_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_p2))) {
    away_captain_assists_p2 = request.body.away_captain_assists_p2;
  }
  if ((typeof(request.body.away_captain_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_p3))) {
    away_captain_assists_p3 = request.body.away_captain_assists_p3;
  }
  if ((typeof(request.body.away_captain_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_ot))) {
    away_captain_assists_ot = request.body.away_captain_assists_ot;
  }

  /** AWAY LIEUTENANT **/
  if ((typeof(request.body.away_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_fights))) {
    away_lieutenant_fights = request.body.away_lieutenant_fights;
  }

  if ((typeof(request.body.away_lieutenant_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_p1))) {
    away_lieutenant_goals_p1 = request.body.away_lieutenant_goals_p1;
  }
  if ((typeof(request.body.away_lieutenant_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_p2))) {
    away_lieutenant_goals_p2 = request.body.away_lieutenant_goals_p2;
  }
  if ((typeof(request.body.away_lieutenant_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_p3))) {
    away_lieutenant_goals_p3 = request.body.away_lieutenant_goals_p3;
  }
  if ((typeof(request.body.away_lieutenant_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_ot))) {
    away_lieutenant_goals_ot = request.body.away_lieutenant_goals_ot;
  }

  if ((typeof(request.body.away_lieutenant_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_p1))) {
    away_lieutenant_assists_p1 = request.body.away_lieutenant_assists_p1;
  }
  if ((typeof(request.body.away_lieutenant_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_p2))) {
    away_lieutenant_assists_p2 = request.body.away_lieutenant_assists_p2;
  }
  if ((typeof(request.body.away_lieutenant_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_p3))) {
    away_lieutenant_assists_p3 = request.body.away_lieutenant_assists_p3;
  }
  if ((typeof(request.body.away_lieutenant_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_ot))) {
    away_lieutenant_assists_ot = request.body.away_lieutenant_assists_ot;
  }

  /** RUN cloud code **/

  Parse.Cloud.run('saveGroupGameResult', { 
    game_id: game_id,
    home_shots_p1: home_shots_p1.toString(),
    home_shots_p2: home_shots_p2.toString(),
    home_shots_p3: home_shots_p3.toString(),
    home_shots_ot: home_shots_ot.toString(),
    home_faceoffs_p1: home_faceoffs_p1.toString(),
    home_faceoffs_p2: home_faceoffs_p2.toString(),
    home_faceoffs_p3: home_faceoffs_p3.toString(),
    home_faceoffs_ot: home_faceoffs_ot.toString(),
    home_captain_fights: home_captain_fights.toString(),
    home_captain_goals_p1: home_captain_goals_p1.toString(),
    home_captain_goals_p2: home_captain_goals_p2.toString(),
    home_captain_goals_p3: home_captain_goals_p3.toString(),
    home_captain_goals_ot: home_captain_goals_ot.toString(),
    home_captain_assists_p1: home_captain_assists_p1.toString(),
    home_captain_assists_p2: home_captain_assists_p2.toString(),
    home_captain_assists_p3: home_captain_assists_p3.toString(),
    home_captain_assists_ot: home_captain_assists_ot.toString(),
    home_lieutenant_fights: home_lieutenant_fights.toString(),
    home_lieutenant_goals_p1: home_lieutenant_goals_p1.toString(),
    home_lieutenant_goals_p2: home_lieutenant_goals_p2.toString(),
    home_lieutenant_goals_p3: home_lieutenant_goals_p3.toString(),
    home_lieutenant_goals_ot: home_lieutenant_goals_ot.toString(),
    home_lieutenant_assists_p1: home_lieutenant_assists_p1.toString(),
    home_lieutenant_assists_p2: home_lieutenant_assists_p2.toString(),
    home_lieutenant_assists_p3: home_lieutenant_assists_p3.toString(),
    home_lieutenant_assists_ot: home_lieutenant_assists_ot.toString(),
    away_shots_p1: away_shots_p1.toString(),
    away_shots_p2: away_shots_p2.toString(),
    away_shots_p3: away_shots_p3.toString(),
    away_shots_ot: away_shots_ot.toString(),
    away_faceoffs_p1: away_faceoffs_p1.toString(),
    away_faceoffs_p2: away_faceoffs_p2.toString(),
    away_faceoffs_p3: away_faceoffs_p3.toString(),
    away_faceoffs_ot: away_faceoffs_ot.toString(),
    away_captain_fights: away_captain_fights.toString(),
    away_captain_goals_p1: away_captain_goals_p1.toString(),
    away_captain_goals_p2: away_captain_goals_p2.toString(),
    away_captain_goals_p3: away_captain_goals_p3.toString(),
    away_captain_goals_ot: away_captain_goals_ot.toString(),
    away_captain_assists_p1: away_captain_assists_p1.toString(),
    away_captain_assists_p2: away_captain_assists_p2.toString(),
    away_captain_assists_p3: away_captain_assists_p3.toString(),
    away_captain_assists_ot: away_captain_assists_ot.toString(),
    away_lieutenant_fights: away_lieutenant_fights.toString(),
    away_lieutenant_goals_p1: away_lieutenant_goals_p1.toString(),
    away_lieutenant_goals_p2: away_lieutenant_goals_p2.toString(),
    away_lieutenant_goals_p3: away_lieutenant_goals_p3.toString(),
    away_lieutenant_goals_ot: away_lieutenant_goals_ot.toString(),
    away_lieutenant_assists_p1: away_lieutenant_assists_p1.toString(),
    away_lieutenant_assists_p2: away_lieutenant_assists_p2.toString(),
    away_lieutenant_assists_p3: away_lieutenant_assists_p3.toString(),
    away_lieutenant_assists_ot: away_lieutenant_assists_ot.toString()
  }).then(function(result){
    var info_msg = encodeURIComponent("Resultat för match med id '" + game_id + "' är sparat med lyckat resultat!");
    response.redirect('/stat/game/' + game_id + '?info=' + info_msg);
  }, function(error){
    var error_msg = encodeURIComponent("Fel uppstod när resultat skulle sparas. Meddelande: '" + error.message + "'");
    response.redirect('/stat/game/' + game_id + '?error=' + error_msg);
  });
};

/**
exports.saveMatchResult = function(req, res) {
  //console.log("Starting to save the result...");
  var result_already_submitted = false;

  var home_goals = req.body.home_goals;
  var away_goals = req.body.away_goals;

  var home_points = 0;
  var away_points = 0;

  var home_win = 0;
  var home_loss = 0;
  var home_tie = 0;
  var home_ot_loss = 0;

  var away_win = 0;
  var away_loss = 0;
  var away_tie = 0;
  var away_ot_loss = 0;

  var overtime_checkbox = req.body.overtime_checkbox;
  //console.log(">>> overtime_checkbox: " + overtime_checkbox);
  var overtime_game = false;

  if(overtime_checkbox === "true"){
    overtime_game = true;
  }

  if((home_goals > away_goals) && !overtime_game){
    home_points = home_points+2;
    home_win = home_win+1;
    away_loss = away_loss+1;
  } else if ((away_goals > home_goals) && !overtime_game) {
    away_points = away_points+2;
    away_win = away_win+1;
    home_loss = home_loss+1;
  } else if ((home_goals > away_goals) && overtime_game){
    home_points = home_points+2;
    away_points = away_points+1;
    home_win = home_win+1;
    away_ot_loss = away_ot_loss+1;
  } else if ((away_goals > home_goals) && overtime_game){
    home_points = home_points+1;
    away_points = away_points+2;
    home_ot_loss = home_ot_loss+1;
    away_win = away_win+1;
  }

  var home_captain_id = req.body.home_captain_id;
  var home_lieutenant_id = req.body.home_lieutenant_id;
  var away_captain_id = req.body.away_captain_id;
  var away_lieutenant_id = req.body.away_lieutenant_id;

  //console.log("home_captain_id: " + home_captain_id + " home_lieutenant_id: " + home_lieutenant_id + " away_captain_id: " + away_captain_id + " away_lieutenant_id: " + away_lieutenant_id);

  var home_captain_goals = req.body.home_captain_goals;
  var home_captain_fights = req.body.home_captain_fights;
  var home_lieutenant_goals = req.body.home_lieutenant_goals;
  var home_lieutenant_fights = req.body.home_lieutenant_fights;
  var away_captain_goals = req.body.away_captain_goals;
  var away_captain_fights = req.body.away_captain_fights;
  var away_lieutenant_goals = req.body.away_lieutenant_goals;
  var away_lieutenant_fights = req.body.away_lieutenant_fights;

  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  gameQuery.equalTo('game_id', req.params.gameid);
  gameQuery.include('result');
  gameQuery.find().then(function(game) {
    if (game) {
      if((_.isEmpty(home_goals)) || (_.isEmpty(away_goals)) || (_.isEmpty(home_captain_id)) || (_.isEmpty(home_captain_goals)) || (_.isEmpty(home_captain_fights)) || (_.isEmpty(home_lieutenant_id)) || (_.isEmpty(home_lieutenant_goals)) || (_.isEmpty(home_lieutenant_fights)) || (_.isEmpty(away_captain_id)) || (_.isEmpty(away_captain_goals)) || (_.isEmpty(away_captain_fights)) || (_.isEmpty(away_lieutenant_id)) || (_.isEmpty(away_lieutenant_goals)) || (_.isEmpty(away_lieutenant_fights))){
        console.error("Some mandatory fields were missing. Canceling!");
        var stringErr = encodeURIComponent('Värden för obligatoriska fält saknades. Se till att fylla i alla fält och försök igen. ');
        var gameIdToSendErr = encodeURIComponent(req.params.gameid);
        var groupIdErr = encodeURIComponent(game[0].get("group"));
        res.redirect('/stat/game/' + req.params.gameid + '?error=' + stringErr + '&idError=' + gameIdToSendErr);
      } else {
        var h_add_player_goals = (parseInt(home_captain_goals)+parseInt(home_lieutenant_goals));
        var a_add_player_goals = (parseInt(away_captain_goals)+parseInt(away_lieutenant_goals));
        //Check to see that the combined player goals does not exceed the amount of team goals. It should be equal.
        if ((_.isEqual(h_add_player_goals, parseInt(home_goals))) && (_.isEqual(a_add_player_goals, parseInt(away_goals)))) {

          result_already_submitted = game[0].get("result_submitted");
          //console.log("Found the game to save...");
          var GameResult = Parse.Object.extend('GameResult');
          var gameResultQuery = new Parse.Query(GameResult);
          gameResultQuery.equalTo('game_id', game[0].get("game_id"));
          gameResultQuery.find().then(function(gResult) {
            if (gResult) {
              //console.log("Found the game result to save...");
              gResult[0].set('home_goals', parseInt(home_goals));
              gResult[0].set('away_goals', parseInt(away_goals));
              gResult[0].set('home_captain_goals', parseInt(home_captain_goals));
              gResult[0].set('home_captain_fights', parseInt(home_captain_fights));
              gResult[0].set('home_lieutenant_goals', parseInt(home_lieutenant_goals));
              gResult[0].set('home_lieutenant_fights', parseInt(home_lieutenant_fights));
              gResult[0].set('away_captain_goals', parseInt(away_captain_goals));
              gResult[0].set('away_captain_fights', parseInt(away_captain_fights));
              gResult[0].set('away_lieutenant_goals', parseInt(away_lieutenant_goals));
              gResult[0].set('away_lieutenant_fights', parseInt(away_lieutenant_fights));
              gResult[0].set('overtime', overtime_game);

              gResult[0].save().then(function(gResSaved) {
                //console.log("Managed to save the result...");
                game[0].set('result_submitted', true);
                game[0].set('played', true);
                game[0].save().then(function(savedGame) {
                  //console.log("Managed to save the game...");
                  var Team = Parse.Object.extend('Team');

                  var innerHomeTeamQuery = new Parse.Query(Team);
                  innerHomeTeamQuery.equalTo('objectId', game[0].get("home").id);

                  var innerAwayTeamQuery = new Parse.Query(Team);
                  innerAwayTeamQuery.equalTo('objectId', game[0].get("away").id);

                  var Standings = Parse.Object.extend('Standings');
                  var standingsQuery = new Parse.Query(Standings);
                  standingsQuery.matchesQuery('team', innerHomeTeamQuery);
                  standingsQuery.include('team');
                  standingsQuery.find().then(function(standingHomeTeam) {
                    if (standingHomeTeam) {
                      console.log("Found the home team standing to save...");
                      var h_points_current = standingHomeTeam[0].get("points");

                      var h_goals_for_current = standingHomeTeam[0].get("goals_for");
                      var h_goals_against_current = standingHomeTeam[0].get("goals_against");
                      var h_wins_current = standingHomeTeam[0].get("wins");
                      var h_losses_current = standingHomeTeam[0].get("losses");
                      var h_ties_current = standingHomeTeam[0].get("tie");
                      var h_ot_loss_current = standingHomeTeam[0].get("ot_losses");
                      var h_games_played_current = standingHomeTeam[0].get("games_played");

                      standingHomeTeam[0].set('points', h_points_current+home_points);

                      standingHomeTeam[0].set('games_played', h_games_played_current+1);
                      standingHomeTeam[0].set('goals_for', h_goals_for_current+parseInt(home_goals));
                      standingHomeTeam[0].set('goals_against', h_goals_against_current+parseInt(away_goals));
                      standingHomeTeam[0].set('losses', h_losses_current+home_loss);
                      standingHomeTeam[0].set('wins', h_wins_current+home_win);
                      standingHomeTeam[0].set('tie', h_ties_current+home_tie);
                      standingHomeTeam[0].set('ot_losses', h_ot_loss_current+home_ot_loss);

                      standingHomeTeam[0].save().then(function(gStandingSaved) {
                        //console.log("Managed to save the result...");
                        var standingsAwayQuery = new Parse.Query(Standings);
                        standingsAwayQuery.matchesQuery('team', innerAwayTeamQuery);
                        standingsAwayQuery.include('team');
                        standingsAwayQuery.find().then(function(standingAwayTeam) {
                          if (standingAwayTeam) {
                            var a_points_current = standingAwayTeam[0].get("points");

                            var a_goals_for_current = standingAwayTeam[0].get("goals_for");
                            var a_goals_against_current = standingAwayTeam[0].get("goals_against");
                            var a_wins_current = standingAwayTeam[0].get("wins");
                            var a_losses_current = standingAwayTeam[0].get("losses");
                            var a_ties_current = standingAwayTeam[0].get("tie");
                            var a_ot_loss_current = standingAwayTeam[0].get("ot_losses");
                            var a_games_played_current = standingAwayTeam[0].get("games_played");

                            standingAwayTeam[0].set('points', a_points_current+away_points);

                            standingAwayTeam[0].set('games_played', a_games_played_current+1);
                            standingAwayTeam[0].set('goals_for', a_goals_for_current+parseInt(away_goals));
                            standingAwayTeam[0].set('goals_against', a_goals_against_current+parseInt(home_goals));
                            standingAwayTeam[0].set('losses', a_losses_current+away_loss);
                            standingAwayTeam[0].set('wins', a_wins_current+away_win);
                            standingAwayTeam[0].set('tie', a_ties_current+away_tie);
                            standingAwayTeam[0].set('ot_losses', a_ot_loss_current+away_ot_loss);

                            standingAwayTeam[0].save().then(function(gStandingAwaySaved) {
                              console.log("Managed to save the result... trying to save player stats");

                              var PlayerStats = Parse.Object.extend('PlayerStats');

                              //Save home captain player stats (goals and fights)
                              var HomeCapQuery = new Parse.Query(PlayerStats);
                              HomeCapQuery.equalTo('player_id', home_captain_id);
                              HomeCapQuery.find().then(function(homeCap) {
                                if (homeCap) {
                                  //console.log("Found the home captain...");
                                  var home_cap_goals_current = parseInt(homeCap[0].get("player_goals"));
                                  var home_cap_fights_current = parseInt(homeCap[0].get("player_fights"));
                                  homeCap[0].set('player_goals', (home_cap_goals_current+parseInt(home_captain_goals)));
                                  homeCap[0].set('player_fights', (home_cap_fights_current+parseInt(home_captain_fights)));
                                  homeCap[0].save().then(function(homeCapSaved) {
                                    console.log("Managed to update the home captain stats...");
                                    //Save home lieutenant player stats (goals and fights)
                                    var HomeLieuQuery = new Parse.Query(PlayerStats);
                                    HomeLieuQuery.equalTo('player_id', home_lieutenant_id);
                                    HomeLieuQuery.find().then(function(homeLieu) {
                                      if (homeLieu) {
                                        //console.log("Found the home lieutenant...");
                                        var home_lieu_goals_current = homeLieu[0].get("player_goals");
                                        var home_lieu_fights_current = homeLieu[0].get("player_fights");
                                        homeLieu[0].set('player_goals', (home_lieu_goals_current+parseInt(home_lieutenant_goals)));
                                        homeLieu[0].set('player_fights', (home_lieu_fights_current+parseInt(home_lieutenant_fights)));
                                        homeLieu[0].save().then(function(homeLieuSaved) {
                                          console.log("Managed to update the home lieutenant stats...");
                                          //Save away captain player stats (goals and fights)
                                          var awayCapQuery = new Parse.Query(PlayerStats);
                                          awayCapQuery.equalTo('player_id', away_captain_id);
                                          awayCapQuery.find().then(function(awayCap) {
                                            if (awayCap) {
                                              //console.log("Found the away captain...");
                                              var away_cap_goals_current = awayCap[0].get("player_goals");
                                              var away_cap_fights_current = awayCap[0].get("player_fights");
                                              awayCap[0].set('player_goals', (away_cap_goals_current+parseInt(away_captain_goals)));
                                              awayCap[0].set('player_fights', (away_cap_fights_current+parseInt(away_captain_fights)));
                                              awayCap[0].save().then(function(awayCapSaved) {
                                                console.log("Managed to update the away captain stats...");
                                                //Save away lieutenant player stats (goals and fights)
                                                var awayLieuQuery = new Parse.Query(PlayerStats);
                                                awayLieuQuery.equalTo('player_id', away_lieutenant_id);
                                                awayLieuQuery.find().then(function(awayLieu) {
                                                  if (awayLieu) {
                                                    //console.log("Found the away lieutenant...");
                                                    var away_lieu_goals_current = awayLieu[0].get("player_goals");
                                                    var away_lieu_fights_current = awayLieu[0].get("player_fights");
                                                    awayLieu[0].set('player_goals', (away_lieu_goals_current+parseInt(away_lieutenant_goals)));
                                                    awayLieu[0].set('player_fights', (away_lieu_fights_current+parseInt(away_lieutenant_fights)));
                                                    awayLieu[0].save().then(function(awayLieuSaved) {
                                                      //console.log("Managed to update the away captain stats...");

                                                      var strMessage = "Match slut i grupp " + game[0].get("group") + " :: " + home_goals + " - " + away_goals + " " + standingHomeTeam[0].get("team").get("team_name") + " vs. " + standingAwayTeam[0].get("team").get("team_name") + " #CobraCup";

                                                      var currentTime = momentSWE(new Date()).locale('sv').format('YYYY-MM-DD HH:mm:ss');
                                                      var published = new Date(currentTime);
                                                      var link = ("/stat/game/" + req.params.gameid);

                                                      var Notification = Parse.Object.extend("Notification");
                                                      var note = new Notification();
                                                      note.set('header', "Matchresultat");
                                                      note.set('message', strMessage);
                                                      note.set('published', published);
                                                      note.set('link', link);
                                                      note.save().then(function(saved_note) {
                                                        console.log("Successfully saved new Notification");
                                                      }, function(error) {
                                                        console.error("Failed saving Notification");
                                                        console.error(error);
                                                      });

                                                      Parse.Cloud.run('sendTweet', { "status": strMessage}, {
                                                        success: function(success) {
                                                          alert(success);
                                                        },
                                                        error: function(error) {
                                                          alert(error);
                                                        }
                                                      });

                                                      var string = encodeURIComponent('Resultat för match med id ');
                                                      var gameIdToSend = encodeURIComponent(req.params.gameid);
                                                      var groupId = encodeURIComponent(game[0].get("group"));
                                                      res.redirect('/games/group/' + groupId + '?info=' + string + '&id=' + gameIdToSend);
                                                    }, function(error) {
                                                      console.error('Error when trying to update away captain player stat');
                                                      console.error(error);
                                                      var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                                      res.redirect('/?error=' + string);
                                                    });
                                                  } else {
                                                    console.error('Error when trying to update away captain player stat');
                                                    var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                                    res.redirect('/?error=' + string);
                                                  }
                                                },
                                                function(error){
                                                  console.error('Error when trying to update away captain player stats');
                                                  console.error(error);
                                                  var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                                  res.redirect('/?error=' + string);
                                                });
                                              }, function(error) {
                                                console.error('Error when trying to update away captain player stat');
                                                console.error(error);
                                                var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                                res.redirect('/?error=' + string);
                                              });
                                            } else {
                                              console.error('Error when trying to find away captain player stat');
                                              var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                              res.redirect('/?error=' + string);
                                            }
                                          },
                                          function(error){
                                            console.error('Error when trying to update away captain player stats');
                                            console.error(error);
                                            var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                            res.redirect('/?error=' + string);
                                          });
                                        }, function(error) {
                                          console.error('Error when trying to update home lieutenant player stat');
                                          console.error(error);
                                        });
                                      } else {
                                        console.error('Error when trying to update home lieutenant player stat');
                                        var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                        res.redirect('/?error=' + string);
                                      }
                                    },
                                    function(error){
                                      console.error('Error when trying to update home lieutenant player stats');
                                      console.error(error);
                                      var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                      res.redirect('/?error=' + string);
                                    });

                                  }, function(error) {
                                    console.error('Error when trying to update home captain player stat');
                                    console.error(error);
                                    var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                    res.redirect('/?error=' + string);
                                  });
                                } else {
                                  console.error('Error when trying to update home captain player stat');
                                  var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                  res.redirect('/?error=' + string);
                                }
                              },
                              function(error){
                                console.error('Error when trying to update home captain player stats');
                                console.error(error);
                                var string = encodeURIComponent('Matchresultat sparat med vissa problem, kontakta admin');
                                res.redirect('/?error=' + string);
                              });
                            }, function(error) {
                              console.error('Error when trying to save game result');
                              console.error(error);
                              var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G8');
                              res.redirect('/?error=' + string);
                            });
                          } else {
                            var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G9');
                            res.redirect('/?error=' + string);
                          }
                        },
                        function(error){
                          console.error('Error when trying to find game result to save');
                          console.error(error);
                          var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G10');
                          res.redirect('/?error=' + string);
                        });

                      }, function(error) {
                        console.error('Error when trying to save game result');
                        console.error(error);
                        var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G11');
                        res.redirect('/?error=' + string);
                      });
                    } else {
                      var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G12');
                      res.redirect('/?error=' + string);
                    }
                  },
                  function(error){
                    console.error('Error when trying to find game result to save');
                    console.error(error);
                    var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G13');
                    res.redirect('/?error=' + string);
                  });
                }, function(error) {
                  console.error('Error when trying to save game');
                  console.error(error);
                  var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G1');
                  res.redirect('/?error=' + string);
                });
              }, function(error) {
                console.error('Error when trying to save game result');
                console.error(error);
                var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G2');
                res.redirect('/?error=' + string);
              });
            } else {
              var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G3');
              res.redirect('/?error=' + string);
            }
          },
          function(error){
            console.error('Error when trying to find game result to save');
            console.error(error);
            var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G4');
            res.redirect('/?error=' + string);
          });

        } else {
          console.error("The amount of goals per player did not equal the amount of goals for the team. Canceling!");
          var stringErr2 = encodeURIComponent('Summan av mängden mål per spelare matchade inte den totala målsumman för lagen. Försök igen.');
          res.redirect('/stat/game/' + req.params.gameid + '?error=' + stringErr2);
        }
      }
    } else {
      var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G5');
      res.redirect('/?error=' + string);
    }
  },
  function(error){
    console.error('Error when trying to find game to report');
    console.error(error);
    var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G6');
    res.redirect('/?error=' + string);
  });
};
**/

exports.loadGames = function(req, res) {
  var teams = "";

  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.ascending('group');
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(results) {
    teams = results;
    var Game = Parse.Object.extend('Game');
    var gameQuery = new Parse.Query(Game);
    gameQuery.ascending('round,group');
    gameQuery.equalTo('played', false);
    gameQuery.include(['home.nhlTeam','away.nhlTeam']);
    gameQuery.include(['home.captain','home.lieutenant']);
    gameQuery.include(['away.captain','away.lieutenant']);

    return gameQuery.find();
  }).then(function(result){
    res.render('games', {
      teams: teams,
      games: result
    });
  }, function(error) {
    log.error("Couldn't load teams. Rendering Games page anyway.");
    log.error(error);
    res.render('games', {});
  });
};

exports.loadGroupGames = function(req, res) {
  var passedErrorVariable = req.query.error;
  var passedErrorGameIdVariable = req.query.idError;
  //console.log("TEST: passedErrorVariable = " + passedErrorVariable + " & passedErrorGameIdVariable = " + passedErrorGameIdVariable);
  var passedInfoVariable = req.query.info;
  var passedIdVariable = req.query.id;

  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  var groupIdentity = parseInt(req.params.groupid);
  console.log("group id: " + req.params.groupid);
  gameQuery.equalTo('group', groupIdentity);
  gameQuery.ascending('round');
  gameQuery.include(['home.nhlTeam','away.nhlTeam']);
  gameQuery.include(['home.captain','home.lieutenant']);
  gameQuery.include(['away.captain','away.lieutenant']);
  gameQuery.find().then(function(games) {
    if (games) {
      console.log("Gotten the games...");
      var Team = Parse.Object.extend('Team');
      var allTeamsQuery = new Parse.Query(Team);
      allTeamsQuery.descending('team_name');
      allTeamsQuery.include('nhlTeam');
      allTeamsQuery.find().then(function(teams) {
        if (teams) {
          var groupName = "Unknown";

          if (_.isEqual(groupIdentity, 1)) {
            groupName = "Atlantic";
          } else if (_.isEqual(groupIdentity, 2)) {
            groupName = "Metropolitan";
          } else if (_.isEqual(groupIdentity, 3)) {
            groupName = "Central";
          } else if (_.isEqual(groupIdentity, 4)) {
            groupName = "Pacific";
          }

          res.render('group_games', {
            games: games,
            teams: teams,
            groupName: groupName,
            groupIdentity: req.params.groupid,
            flashInfo: passedInfoVariable,
            flashGameId: passedIdVariable,
            flashErrorGame: passedErrorVariable,
            flashErrorGameId: passedErrorGameIdVariable
          });
        } else {
          res.render('group_games', {
            flashError: "Kunde inte ladda match. Försök igen"
          });
        }
      },
      function(error) {
        console.error('Error when trying to get all teams');
        console.error(error);
        res.render('group_games', {
          flashError: "Kunde inte ladda match. Försök igen"
        });
      });
    } else {
      res.render('group_games', {
        flashError: "Kunde inte ladda match. Försök igen"
      });
    }
  },
  function(error){
    console.error('Error when trying to find game to report');
    console.error(error);
    res.render('group_games', {flashError: 'Problem när den önskade matchen skulle hämtas'});
  });
};

exports.loadFeed = function(req, res) {
  var Notification = Parse.Object.extend('Notification');
  var notifcationQuery = new Parse.Query(Notification);
  notifcationQuery.descending('createdAt');
  notifcationQuery.find().then(function(notes) {
    if (notes) {
      console.log("Gotten the Notes...");
      res.render('feed', {
        notifications: notes
      });
    } else {
      console.error('Problem when trying to get the notes.');
      res.render('hub', {flashError: 'Problem när livefeeden skulle hämtas.'});
    }
  },
  function(error){
    console.error('Error when trying to get the live feed');
    console.error(error);
    res.render('hub', {flashError: ('Problem när livefeeden skulle hämtas: ' + error.message)});
  });
};
