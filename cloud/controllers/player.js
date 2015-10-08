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
  //Not implemented
};

exports.deletePlayer = function(request, response) {
  //Not implemented
};