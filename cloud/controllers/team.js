var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

exports.getTeam = function(request, response) {
  console.log("----------- GETTING TEAM -----------" + "\n" + "\n");

  var passedInfoVariable = request.query.info;
  console.log("info variable = " + passedInfoVariable);

  var objTeam;
  var objStandings;
  var objGames;
  var objTeams;
  var objLastPlayedGame;
  var objFlashInfo = passedInfoVariable;
  var objFlashWarning = [];

  var Game = Parse.Object.extend('Game');
  var Team = Parse.Object.extend('Team');

  var teamQuery = new Parse.Query(Team);
  teamQuery.equalTo('team_id', request.params.teamid);
  teamQuery.include(['nhlTeam','captain','lieutenant']);
  teamQuery.find().then(function(result) {
    if((typeof(result[0]) !== 'undefined') && (typeof(result[0].id) !== 'undefined')){
      var promise = Parse.Promise.as();
      console.log("Found Team with objectId = " + result[0].id + "\n");

      objTeam = result[0];

      var Standings = Parse.Object.extend('Standings');
      var standingsQuery = new Parse.Query(Standings);
      standingsQuery.descending('points');
      standingsQuery.include(["team.nhlTeam"]);

      promise = promise.then(function() {
        return standingsQuery.find();
      });

      return promise;

    } else {
      console.error("Can't find a team with id " + request.params.teamid);
      return Parse.Promise.error(404);
    }
  }).then(function(standings){
    if((typeof(standings) !== 'undefined') && (!_.isNull(standings))){
      var promise = Parse.Promise.as();
      
      var size = _.size(standings);
      console.log("Retrieved Standings for " + size + " Teams");

      objStandings = standings;
    } else {
      console.error("Couldn't fetch any standings");
      objFlashWarning.push("Information om tabellen kunde inte hämtas eller finns inte");
    }

    if (typeof(objTeam) !== 'undefined') {
      var innerTeamQuery = new Parse.Query(Team);
      innerTeamQuery.equalTo('objectId', objTeam.id);

      var homeTeamQuery = new Parse.Query(Game);
      homeTeamQuery.matchesQuery('home', innerTeamQuery);

      var awayTeamQuery = new Parse.Query(Game);
      awayTeamQuery.matchesQuery('away', innerTeamQuery);

      var gameQuery = Parse.Query.or(homeTeamQuery, awayTeamQuery);
      gameQuery.ascending("date");
      gameQuery.equalTo('played', false);
      gameQuery.include("result");

      promise = promise.then(function() {
        return gameQuery.find();
      });

      return promise;

    } else {
      //Should never get here...
      console.error("Can't get games info without a team...");
      return Parse.Promise.error("Can't get games info without a team");
    }

  }).then(function(games){

    if((typeof(games) !== 'undefined') && (!_.isNull(games))){
      var promise = Parse.Promise.as();
      var size = _.size(games);
      console.log("Retrieved " + size + " Games");

      if (size <= 0) {
        objFlashWarning.push("Laget har inga planerade matcher");
      }

      objGames = games;

    } else {
      console.error("Couldn't get all Games...");
      objFlashWarning.push("Problem när matcher skulle hämtas");
    }

    var allTeamsQuery = new Parse.Query(Team);
    allTeamsQuery.descending('team_name');
    allTeamsQuery.include(['nhlTeam','captain','lieutenant']);

    promise = promise.then(function() {
      return allTeamsQuery.find();
    });

    return promise;

  }).then(function(teams){

    if((typeof(teams) !== 'undefined') && (!_.isNull(teams))){
      var promise = Parse.Promise.as();
      var size = _.size(teams);
      console.log("Retrieved " + size + " Teams");

      objTeams = teams;

    } else {
      console.error("Couldn't get all teams...");
      objFlashWarning.push("Problem när lag skulle hämtas");
    }

    if (typeof(objTeam) !== 'undefined') {
      var innerTeamQuery = new Parse.Query(Team);
      innerTeamQuery.equalTo('objectId', objTeam.id);

      var homeTeamQuery = new Parse.Query(Game);
      homeTeamQuery.matchesQuery('home', innerTeamQuery);

      var awayTeamQuery = new Parse.Query(Game);
      awayTeamQuery.matchesQuery('away', innerTeamQuery);

      var latestGameQuery = Parse.Query.or(homeTeamQuery, awayTeamQuery);
      latestGameQuery.descending("date");
      latestGameQuery.equalTo('played', true);
      latestGameQuery.include("result");

      promise = promise.then(function() {
        return latestGameQuery.first();
      });

      return promise;

    } else {
      //Should never get here...
      console.error("Can't get latest Game without a team...");
      return Parse.Promise.error("Can't get latest Game without a team");
    }

  }).then(function(game){
    if((typeof(game) !== 'undefined') && (!_.isNull(game))){
      var promise = Parse.Promise.as();
      console.log("Retrieved game with id " + game.id);

      objLastPlayedGame = game;

    } else {
      console.error("Couldn't get latest played game...");
      objFlashWarning.push("Problem när senast spelade match skulle hämtas");
    }

    response.render('team', {
      teamObj: objTeam,
      standings: objStandings,
      games: objGames,
      teams: objTeams,
      lastPlayedGame: objLastPlayedGame,
      flashInfo: objFlashInfo,
      flashWarning: objFlashWarning
    });

  }, function(error){
      if((typeof(error.code) !== 'undefined') || (typeof(error.message) !== 'undefined')){
          console.log("Deleting Team failed with error.code " + error.code + " error.message " + error.message);
      } else {
          console.log("Deleting Team failed with error.message: " + error);
      }

      if (_.isEqual(error, 404)) {
        response.status(404);
        response.render('404');
      } else {
        response.status(500).send({ error: error });
      }
  });
};

exports.delete = function(req, res) {
  var teamid = req.params.teamid;
};

exports.update = function(req, res) {
  var teamid = req.params.teamid;
};