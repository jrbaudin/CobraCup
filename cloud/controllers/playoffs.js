var _ = require('underscore');

exports.loadPOGames = function(request, response) {
  var passedErrorVariable = request.query.error;
  var passedInfoVariable = request.query.info;

  Parse.Cloud.run('getPlayoffGames', {}).then(function(results){
    response.render('playoffs', {
      games: results,
      flashError: passedErrorVariable,
      flashInfo: passedInfoVariable
    });
  }, function(error){
    console.log(error);
    response.send(500, 'Failed loading Playoff games');
  });
};

exports.loadPOGameReporter = function(request, response) {
  var passedErrorVariable = request.query.error;
  var passedInfoVariable = request.query.info;

  var POGame = Parse.Object.extend('POGame');
  var gameQuery = new Parse.Query(POGame);
  gameQuery.equalTo('game_id', request.params.gameid);
  gameQuery.include(['home.nhlTeam','away.nhlTeam']);
  gameQuery.include(['home.captain','home.lieutenant']);
  gameQuery.include(['away.captain','away.lieutenant']);
  gameQuery.find().then(function(game) {
    response.render('po_reporter', {
      game: game,
      flashError: passedErrorVariable,
      flashInfo: passedInfoVariable
    });
  }, function(error){
    var error_msg = "Problem när den önskade matchen med id '" + request.params.gameid + "' skulle hämtas. Sannolikt finns det ingen match med det id't";
    console.log("Getting Game with id '" + request.params.gameid + "' failed with error.code " + error.code + " error.message " + error.message);
    response.render('reporter', {
      flashError: error_msg
    });
  });
};

exports.savePOGameResult = function(request, response) {
  var passedErrorVariable = request.query.error;
  var passedInfoVariable = request.query.info;

  Parse.Cloud.run('getPlayoffGames', {}).then(function(results){
    response.render('playoffs', {
      games: results,
      flashError: passedErrorVariable,
      flashInfo: passedInfoVariable
    });
  }, function(error){
    console.log(error);
    response.send(500, 'Failed loading Playoff games');
  });
};