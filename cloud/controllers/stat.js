var _ = require('underscore');

exports.showLeague = function(req, res) {
  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.descending('points');
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
  standingsQuery.descending('points');
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

exports.showPlayerStats = function(req, res) {
  var PlayerStats = Parse.Object.extend('PlayerStats');
  var playerStatGoalQuery = new Parse.Query(PlayerStats);
  playerStatGoalQuery.descending('player_goals');
  playerStatGoalQuery.include("player_team.nhlTeam");
  playerStatGoalQuery.find().then(function(playerGoalStats) {
    if (playerGoalStats) {
      console.log("Gotten the playerGoalStats...");
      //console.log("playerStats: " + JSON.stringify(playerStats));
      var playerStatFightQuery = new Parse.Query(PlayerStats);
      playerStatFightQuery.descending('player_fights');
      playerStatFightQuery.include("player_team.nhlTeam");
      playerStatFightQuery.find().then(function(playerFightStats) {
        if (playerFightStats) {
          console.log("Gotten the playerFightStats...");
          //console.log("playerStats: " + JSON.stringify(playerStats));
          res.render('playerstats', {
            playerGoals: playerGoalStats,
            playerFights: playerFightStats
          });
        } else {
          console.error('Problem when trying to get player stats, could not get any');
          res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
        }
      },
      function(error){
        console.error('Error when trying to get player stats');
        console.error(error);
        res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
      });

    } else {
      console.error('Problem when trying to get player stats, could not get any');
      res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
    }
  },
  function(error){
    console.error('Error when trying to get player stats');
    console.error(error);
    res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
  });
};