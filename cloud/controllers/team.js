var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

exports.getTeam = function(req, res) {
  console.log("Trying to get the team..");
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.equalTo('team_id', req.params.teamid);
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(theTeam) {
    if (theTeam) {
      console.log("Gotten the team...");
      var Standings = Parse.Object.extend('Standings');
      var standingsQuery = new Parse.Query(Standings);
      standingsQuery.descending('points');
      standingsQuery.include(["team.nhlTeam"]);
      standingsQuery.limit(3);
      standingsQuery.find().then(function(standings) {
        if (standings) {
          console.log("Gotten the standings...");
          var Game = Parse.Object.extend('Game');
          var hometeam = new Parse.Query(Game);
          hometeam.equalTo('objectId', theTeam[0].id);
          hometeam.include(["home.nhlTeam"]);
          hometeam.include(["away.nhlTeam"]);

          var awayteam = new Parse.Query(Game);
          awayteam.equalTo('objectId', theTeam[0].id);
          awayteam.include(["home.nhlTeam"]);
          awayteam.include(["away.nhlTeam"]);

          var gameQuery = Parse.Query.or(hometeam, awayteam);
          gameQuery.descending("date");
          gameQuery.find().then(function(games) {
            if (games) {
              console.log("Gotten the games...");
              res.render('team', {
                teamObj: theTeam,
                standings: standings,
                games: games
              });
            } else {
              res.render('team', {
                teamObj: theTeam,
                standings: standings
              });
            }
          },
          function(error){
            console.error('Error when trying to get team standings');
            console.error(error);
            res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas.'});
          });
        } else {
          res.render('team', {
            teamObj: theTeam
          });
        }
      },
      function(error){
        console.error('Error when trying to get team standings');
        console.error(error);
        res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas.'});
      });
    } else {
      res.render('hub', {
        flashError: "Kunde inte ladda lag. Försök igen."
      });
    }
  },
  function(error){
    console.error('Error when trying to find team to view');
    console.error(error);
    res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas.'});
  });
};

exports.delete = function(req, res) {
  var teamid = req.params.teamid;
};

exports.update = function(req, res) {
  var teamid = req.params.teamid;
};