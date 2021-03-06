var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

exports.getPlayer = function(request, response) {
  Parse.Cloud.run('getPlayer', { player_id: request.params.playerid}, {
    success: function(result) {

      var arrData = [];
      var stats = result[0].get("stats")
      var goalsList = _.sortBy(stats.seasons, function(season){
                          return season.season; 
                      });
      
      var goalsPluck = _.pluck(goalsList, 'goals');
      var seasonPluck = _.pluck(goalsList, 'season');

      
      if (_.size(goalsPluck) < 2) {
        var i = 0;
        _.each(goalsPluck, function(year){
          if (_.isEqual(seasonPluck[i], 2014)) {
              arrData.push(year);
              arrData.push(0);
          } else if (_.isEqual(seasonPluck[i], 2015)){
            arrData.push(0);
            arrData.push(year);
          }
        });
        
      } else {
        _.each(goalsPluck, function(year){
            arrData.push(year);
        });
      }
      /*var arrTeamGoals = [];
      var tStats = result[0].get("team").get("stats");
      var tGoalsList = _.sortBy(tStats.seasons, function(season){
                          return season.season; 
                      });
      
      var tGoalsPluck = _.pluck(tGoalsList, 'gf');

      _.each(tGoalsPluck, function(tYear){
          console.log("T goals > " + tYear);
          arrTeamGoals.push(tYear);
      });
      console.log("arrTeamGoals Size = " + _.size(arrTeamGoals));*/

      response.render('player', {
        player: result,
        graphData: arrData
      });
    },
    error: function(error) {
      alert(error);
      response.send(500, 'Failed loading Player with id ' + request.params.playerid);
    }
  });
};

exports.getPlayerForUpdate = function(request, response) {
  Parse.Cloud.run('getPlayer', { player_id: request.params.playerid}, {
    success: function(result) {
      response.render('edit-player', {
        player: result
      });
    },
    error: function(error) {
      alert(error);
      response.send(500, 'Failed loading Player with id ' + request.params.playerid);
    }
  });
};

exports.updatePlayer = function(request, response) {

  var telephone = "";
  var email = "";
  var birthyear = "";
  var birthplace = "";
  var nation = "";
  var position = "";
  var shoots = "";
  var profile = "";
  var twitter = "";
  var facebook = "";
  var gamertag = "";
  var psn_id = "";

  if ((typeof(request.body.telephone) !== 'undefined') && (!_.isEmpty(request.body.telephone))) {
    telephone = request.body.telephone;
  }
  if ((typeof(request.body.email) !== 'undefined') && (!_.isEmpty(request.body.email))) {
    email = request.body.email;
  }
  if ((typeof(request.body.birthyear) !== 'undefined') && (!_.isEmpty(request.body.birthyear))) {
    birthyear = request.body.birthyear;
  }
  if ((typeof(request.body.birthplace) !== 'undefined') && (!_.isEmpty(request.body.birthplace))) {
    birthplace = request.body.birthplace;
  }
  if ((typeof(request.body.nation) !== 'undefined') && (!_.isEmpty(request.body.nation))) {
    nation = request.body.nation;
  }
  if ((typeof(request.body.position) !== 'undefined') && (!_.isEmpty(request.body.position))) {
    position = request.body.position;
  }
  if ((typeof(request.body.shoots) !== 'undefined') && (!_.isEmpty(request.body.shoots))) {
    shoots = request.body.shoots;
  }
  if ((typeof(request.body.profile) !== 'undefined') && (!_.isEmpty(request.body.profile))) {
    profile = request.body.profile;
  }
  if ((typeof(request.body.twitter) !== 'undefined') && (!_.isEmpty(request.body.twitter))) {
    twitter = request.body.twitter;
  }
  if ((typeof(request.body.facebook) !== 'undefined') && (!_.isEmpty(request.body.facebook))) {
    facebook = request.body.facebook;
  }
  if ((typeof(request.body.gamertag) !== 'undefined') && (!_.isEmpty(request.body.gamertag))) {
    gamertag = request.body.gamertag;
  }
  if ((typeof(request.body.psn_id) !== 'undefined') && (!_.isEmpty(request.body.psn_id))) {
    psn_id = request.body.psn_id;
  }

  Parse.Cloud.run('updatePlayer', { player_id: request.params.playerid, 
    telephone: telephone,
    email: email,
    birthyear: birthyear,
    birthplace: birthplace,
    nation: nation,
    position: position,
    shoots: shoots,
    profile: profile,
    twitter: twitter,
    facebook: facebook,
    gamertag: gamertag,
    psn_id: psn_id }, {
    success: function(result) {
      //response.send(200, 'Updated Player with id ' + request.params.playerid);
      //response.json(result);
      response.redirect('/player/' + request.params.playerid);
    },
    error: function(error) {
      alert(error);
      response.send(500, 'Failed updating Player with id ' + request.params.playerid);
    }
  });
};

exports.deletePlayer = function(request, response) {
  //Not implemented
};

exports.getListForParticipantFees = function(request, response) {
  Parse.Cloud.run('getPlayers', {}, {
    success: function(results) {
      var resultList = _.sortBy(results, function(player){
                          var payed = player.get("payed");
                          return payed;
                        });
      resultList = resultList.reverse();

      response.render('participant-fee', {
        players: resultList
      });
    },
    error: function(error) {
      alert(error);
      response.render('participant-fee', {
        flashError: error
      });
    }
  });
};