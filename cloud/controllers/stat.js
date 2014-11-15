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
  var Team = Parse.Object.extend('Team');
  var teamsQuery = new Parse.Query(Team);
  teamsQuery.include("nhlTeam");
  teamsQuery.find().then(function(teams) {
    if (teams) {
      console.log("Gotten the standings...");
      res.render('playerstats', {
        teams: teams
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