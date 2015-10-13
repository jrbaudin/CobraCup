var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

// Display a form for signing up a new team.
exports.new = function(req, res) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.count({
    success: function(number) {
      console.log("number: " + number);
      if(number <=19){
        var NHLTeam = Parse.Object.extend('NHLTeam');
        var nhlTeamQuery = new Parse.Query(NHLTeam);
        nhlTeamQuery.ascending('name');
        //nhlTeamQuery.notEqualTo("taken", true);
        nhlTeamQuery.find().then(function(nhlteams) {
          if (nhlteams) {
            res.render('signup', {
              nhlteams: nhlteams
            });
          } else {
            res.render('signup', {});
          }
        },
        function() {
          res.send(500, 'Failed finding teams');
        });
      } else {
        var passedWarningVariable = "Alla platser för Cobra Cup 2016 är bokade!";
        var Team = Parse.Object.extend('Team');
        var teamQuery = new Parse.Query(Team);
        teamQuery.descending('createdAt');
        teamQuery.include('nhlTeam');
        teamQuery.find().then(function(teams) {
          if (teams) {
            var count = _.size(teams);
            console.log("count: " + count);
            res.render('hub', {
              teams: teams,
              count: count,
              flashWarning: passedWarningVariable
            });
          } else {
            res.render('hub', {flash: 'Inga lag är ännu registrerade.'});
          }
        },
        function() {
          res.send(500, 'Failed finding teams');
        });
      }
    },
    error: function(error) {
      res.send(500, 'Failed getting a count of the teams');
    }
  });
};

// Display a form for signing up a new team.
exports.rookie = function(req, res) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.equalTo('level', "1");
  teamQuery.count({
    success: function(number) {
      if(number <=3){
        var NHLTeam = Parse.Object.extend('NHLTeam');
        var nhlTeamQuery = new Parse.Query(NHLTeam);
        nhlTeamQuery.ascending('name');
        nhlTeamQuery.equalTo("taken_rookie", false);
        nhlTeamQuery.find().then(function(nhlteams) {
          console.log("How many available NHLteams = " + _.size(nhlteams));
          if (nhlteams) {
            res.render('signup-rookie', {
              nhlteams: nhlteams
            });
          } else {
            res.send(500, 'Failed finding teams');
          }
        },
        function(error) {
          console.log("Team retrieval failed with error.code " + error.code + " error.message " + error.message);
          res.send(500, 'Failed finding teams');
        });
      } else {
        var passedWarningVariable = "Alla platser för Hot Rod 2016 är bokade!";
        var Team = Parse.Object.extend('Team');
        var teamQuery = new Parse.Query(Team);
        teamQuery.ascending('team_name');
        teamQuery.include('nhlTeam');
        teamQuery.find().then(function(teams) {
          if (teams) {
            var count = _.size(teams);
            res.render('hub', {
              teams: teams,
              count: count,
              flashWarning: passedWarningVariable
            });
          } else {
            res.render('hub', {flash: 'Inga lag är ännu registrerade.'});
          }
        },
        function() {
          res.send(500, 'Failed finding teams');
        });
      }
    },
    error: function(error) {
      res.send(500, 'Failed getting a count of the teams');
    }
  });
};

// Create a new team with specified information.
exports.create = function(request, response) {
  var captain_name = "";
  var captain_email = "";
  var captain_telephone = "";
  var captain_gamertag = "";

  var lieutenant_name = "";
  var lieutenant_email = "";
  var lieutenant_telephone = "";
  var lieutenant_gamertag = "";

  var team_name = "";
  var team_motto = "";
  var nhlTeam = "";
  var level = "";
  var comment = "";

  //Captain
  if ((typeof(request.body.captain_name) !== 'undefined') && (!_.isEmpty(request.body.captain_name))) {
    captain_name = request.body.captain_name;
  }
  if ((typeof(request.body.captain_email) !== 'undefined') && (!_.isEmpty(request.body.captain_email))) {
    captain_email = request.body.captain_email;
  }
  if ((typeof(request.body.captain_telephone) !== 'undefined') && (!_.isEmpty(request.body.captain_telephone))) {
    captain_telephone = request.body.captain_telephone;
  }
  if ((typeof(request.body.captain_gamertag) !== 'undefined') && (!_.isEmpty(request.body.captain_gamertag))) {
    captain_gamertag = request.body.captain_gamertag;
  }
  //Lieutenant
  if ((typeof(request.body.lieutenant_name) !== 'undefined') && (!_.isEmpty(request.body.lieutenant_name))) {
    lieutenant_name = request.body.lieutenant_name;
  }
  if ((typeof(request.body.lieutenant_email) !== 'undefined') && (!_.isEmpty(request.body.lieutenant_email))) {
    lieutenant_email = request.body.lieutenant_email;
  }
  if ((typeof(request.body.lieutenant_telephone) !== 'undefined') && (!_.isEmpty(request.body.lieutenant_telephone))) {
    lieutenant_telephone = request.body.lieutenant_telephone;
  }
  if ((typeof(request.body.lieutenant_gamertag) !== 'undefined') && (!_.isEmpty(request.body.lieutenant_gamertag))) {
    lieutenant_gamertag = request.body.lieutenant_gamertag;
  }

  //Team info
  if ((typeof(request.body.team_name) !== 'undefined') && (!_.isEmpty(request.body.team_name))) {
    team_name = request.body.team_name;
  }
  if ((typeof(request.body.team_motto) !== 'undefined') && (!_.isEmpty(request.body.team_motto))) {
    team_motto = request.body.team_motto;
  }
  if ((typeof(request.body.nhlTeam) !== 'undefined') && (!_.isEmpty(request.body.nhlTeam))) {
    nhlTeam = request.body.nhlTeam;
  }
  if ((typeof(request.body.level) !== 'undefined') && (!_.isEmpty(request.body.level))) {
    level = request.body.level;
  }
  if ((typeof(request.body.comment) !== 'undefined') && (!_.isEmpty(request.body.comment))) {
    comment = request.body.comment;
  }

  Parse.Cloud.run('createTeam', { captain_name: captain_name, captain_email: captain_email, captain_telephone: captain_telephone, captain_gamertag: captain_gamertag, lieutenant_name: lieutenant_name, lieutenant_email: lieutenant_email, lieutenant_telephone: lieutenant_telephone, lieutenant_gamertag: lieutenant_gamertag, team_name: team_name, team_motto: team_motto, nhlTeam: nhlTeam, level: level, comment: comment }, {
    success: function(result) {
      //response.send(200, 'Updated Player with id ' + request.params.playerid);
      
      console.log('Lag ' + team_name + ' är nu sparat med id ' + result.id);
      //console.log('Lag ' + JSON.stringify(result));
      var info_msg = encodeURIComponent('Ditt lag ' + team_name + ' är nu sparat. Lycka till!');
      response.redirect('/team/' + result.get("team_id") + '?info=' + info_msg);
      //response.json(result);
    },
    error: function(error) {
      alert(error);
      console.log(error);
      //response.send(500, error);
      response.json(error);
    }
  });
};