var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

exports.getPlayer = function(request, response) {
  Parse.Cloud.run('getPlayer', { player_id: request.params.playerid}, {
    success: function(result) {
      response.render('player', {
        player: result
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

  Parse.Cloud.run('updatePlayer', { player_id: request.params.playerid, telephone: telephone, email: email, birthyear: birthyear, birthplace: birthplace, nation: nation, position: position, shoots: shoots, profile: profile, twitter: twitter, facebook: facebook, gamertag: gamertag }, {
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