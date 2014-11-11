var _ = require('underscore');
//var Mailgun = require('mailgun');
//Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

exports.getTeam = function(req, res) {
  console.log("Trying to get the team..");
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.equalTo('team_id', req.params.teamid);
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(theTeam) {
    if (theTeam) {
      var innerTeamQuery = new Parse.Query(Team);
      innerTeamQuery.equalTo('objectId', theTeam[0].id);

      var TeamStat = Parse.Object.extend('TeamStat');
      var teamStatQuery = new Parse.Query(TeamStat);
      teamStatQuery.matchesQuery('team', innerTeamQuery);
      teamStatQuery.find().then(function(stat) {
        if (stat) {
          var Standings = Parse.Object.extend('Standings');
          var standingsQuery = new Parse.Query(Standings);
          standingsQuery.descending('points');
          standingsQuery.include(["team.nhlTeam"]);
          standingsQuery.limit(3)
          standingsQuery.find().then(function(standings) {
            if (standings) {
              res.render('team', { 
                teamObj: theTeam,
                statistic: stat,
                standings: standings
              });
            } else {
              res.render('team', { 
                teamObj: theTeam,
                statistic: stat
              });
            }
          },
          function(error) {
            console.error('Error when trying to get team standings');
            console.error(error);
            res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas.'});
          });
        } else {
          console.log("couldn't get the stat.. ");
          res.render('team', { 
            teamObj: theTeam
          });
        }
      },
      function(error) {
        console.error('Error when trying to get team stats');
        console.error(error);
        res.render('hub', {flashError: 'Problem när det önskade laget skulle hämtas.'});
      });
    } else {
      res.render('hub', {
        flashError: "Kunde inte ladda lag. Försök igen."
      });
    }
  },
  function(error) {
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
