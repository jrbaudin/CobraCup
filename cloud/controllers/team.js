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
          var innerTeamQuery = new Parse.Query(Team);
          innerTeamQuery.equalTo('objectId', theTeam[0].id);

          var Game = Parse.Object.extend('Game');

          var homeTeamQuery = new Parse.Query(Game);
          homeTeamQuery.matchesQuery('home', innerTeamQuery);
          homeTeamQuery.include(["away.nhlTeam"]);
          homeTeamQuery.ascending("date");

          homeTeamQuery.find().then(function(homeGames) {
            if (homeGames) {
              console.log("Gotten the home games...");
              //console.log("homeGames object: " + JSON.stringify(homeGames));
              //console.log("homeGames away team object: " + JSON.stringify(homeGames[0].get("away")));

              var awayTeamQuery = new Parse.Query(Game);
              awayTeamQuery.matchesQuery('away', innerTeamQuery);
              awayTeamQuery.include(["home.nhlTeam"]);
              awayTeamQuery.ascending("date");

              awayTeamQuery.find().then(function(awayGames) {
                if (awayGames) {
                  console.log("Gotten the away games...");
                  //console.log("awayGames object: " + JSON.stringify(awayGames));
                  //console.log("awayGames home team object: " + JSON.stringify(awayGames[0].get("home")));
                  res.render('team', {
                    teamObj: theTeam,
                    standings: standings,
                    homeGames: homeGames,
                    awayGames: awayGames
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