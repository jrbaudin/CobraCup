var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

exports.getTeam = function(req, res) {
  //console.log("Trying to get the team..");
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
      //standingsQuery.limit(5);
      standingsQuery.find().then(function(standings) {
        if (standings) {
          var PlayerStats = Parse.Object.extend('PlayerStats');
          var playerStatsQuery = new Parse.Query(PlayerStats);
          playerStatsQuery.find().then(function(playerStats) {
            if (playerStats) {
              var Game = Parse.Object.extend('Game');

              var innerTeamQuery = new Parse.Query(Team);
              innerTeamQuery.equalTo('objectId', theTeam[0].id);

              var homeTeamQuery = new Parse.Query(Game);
              homeTeamQuery.matchesQuery('home', innerTeamQuery);

              var awayTeamQuery = new Parse.Query(Game);
              awayTeamQuery.matchesQuery('away', innerTeamQuery);

              var gameQuery = Parse.Query.or(homeTeamQuery, awayTeamQuery);
              gameQuery.ascending("date");
              gameQuery.equalTo('played', false);
              gameQuery.include("result");
              gameQuery.find().then(function(games) {
                if (games) {
                  //console.log("Gotten the games...");
                  var allTeamsQuery = new Parse.Query(Team);
                  allTeamsQuery.descending('team_name');
                  allTeamsQuery.include('nhlTeam');
                  allTeamsQuery.find().then(function(teams) {
                    if (teams) {
                      var latestGameQuery = Parse.Query.or(homeTeamQuery, awayTeamQuery);
                      latestGameQuery.descending("date");
                      latestGameQuery.equalTo('played', true);
                      latestGameQuery.include("result");
                      latestGameQuery.first().then(function(lastPlayedGame) {
                        if (lastPlayedGame) {
                          res.render('team', {
                            teamObj: theTeam,
                            standings: standings,
                            playerStats: playerStats,
                            games: games,
                            teams: teams,
                            lastPlayedGame: lastPlayedGame
                          });
                        } else {
                          res.render('team', {
                            teamObj: theTeam,
                            standings: standings,
                            playerStats: playerStats,
                            games: games,
                            teams: teams,
                            flashWarning: 'Matchdata kunde inte hämtas eller finns inte'
                          });
                        }
                      },
                      function(error){
                        console.error('Error when trying to get the last played game');
                        console.error(error);
                        res.render('team', {
                          teamObj: theTeam,
                          standings: standings,
                          playerStats: playerStats,
                          games: games,
                          teams: teams,
                          flashWarning: 'Matchdata kunde inte hämtas eller finns inte'
                        });
                      });
                    } else {
                      res.render('team', {
                        teamObj: theTeam,
                        standings: standings,
                        playerStats: playerStats,
                        flashWarning: 'Matchdata kunde inte hämtas eller finns inte'
                      });
                    }
                  },
                  function(error) {
                    console.error('Error when trying to get all teams');
                    console.error(error);
                    res.render('team', {
                      teamObj: theTeam,
                      standings: standings,
                      playerStats: playerStats,
                      flashWarning: 'Matchdata kunde inte hämtas eller finns inte'
                    });
                  });
                } else {
                  res.render('team', {
                    teamObj: theTeam,
                    standings: standings,
                    playerStats: playerStats,
                    flashWarning: 'Matchdata kunde inte hämtas eller finns inte'
                  });
                }
              },
              function(error){
                res.render('team', {
                  teamObj: theTeam,
                  standings: standings,
                  playerStats: playerStats,
                  flashWarning: 'Matchdata kunde inte hämtas eller finns inte'
                });
              });
            } else {
              res.render('team', {
                teamObj: theTeam,
                standings: standings,
                flashWarning: 'Information om spelarstatistik kunde inte hämtas eller finns inte'
              });
            }
          },
          function(error){
            console.error('Error when trying to get player stats');
            console.error(error);
            res.render('team', {
              teamObj: theTeam,
              standings: standings,
              flashWarning: 'Information om spelarstatistik kunde inte hämtas eller finns inte'
            });
          });
        } else {
          res.render('team', {
            teamObj: theTeam,
            flashWarning: 'Information om tabellen kunde inte hämtas eller finns inte'
          });
        }
      },
      function(error){
        console.error('Error when trying to get team standings');
        console.error(error);
        res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas'});
      });
    } else {
      res.render('hub', {
        flashError: "Kunde inte ladda lag. Försök igen"
      });
    }
  },
  function(error){
    console.error('Error when trying to find team to view');
    console.error(error);
    res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas'});
  });
};

exports.delete = function(req, res) {
  var teamid = req.params.teamid;
};

exports.update = function(req, res) {
  var teamid = req.params.teamid;
};