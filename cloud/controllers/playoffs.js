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