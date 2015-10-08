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

exports.updatePlayer = function(request, response) {

  var player_id = request.params.playerid;

  var objPlayer = "{";

  objPlayer = objPlayer + "player_id:" + player_id;

  if ((typeof(request.body.birthyear) !== 'undefined') && (!_.isEmpty(request.body.birthyear))) {
    objPlayer = objPlayer + "birthyear:" + request.body.birthyear;
  }
  if ((typeof(request.body.birthplace) !== 'undefined') && (!_.isEmpty(request.body.birthplace))) {
    objPlayer = objPlayer + "birthplace:" + request.body.birthplace;
  }
  if ((typeof(request.body.nation) !== 'undefined') && (!_.isEmpty(request.body.nation))) {
    objPlayer = objPlayer + "nation:" + request.body.nation;
  }
  if ((typeof(request.body.position) !== 'undefined') && (!_.isEmpty(request.body.position))) {
    objPlayer = objPlayer + "position:" + request.body.position;
  }
  if ((typeof(request.body.shoots) !== 'undefined') && (!_.isEmpty(request.body.shoots))) {
    objPlayer = objPlayer + "shoots:" + request.body.shoots;
  }

  objPlayer = objPlayer + "}";

  console.log("objPlayer = " + objPlayer);

  Parse.Cloud.run('updatePlayer', objPlayer, {
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

exports.deletePlayer = function(request, response) {
  //Not implemented
};