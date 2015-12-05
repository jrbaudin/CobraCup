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
  var game_id = request.params.gameid;

  /** HOME **/
  var home_shots_p1 = 0;
  var home_shots_p2 = 0;
  var home_shots_p3 = 0;
  var home_shots_ot = 0;

  var home_faceoffs_p1 = 0;
  var home_faceoffs_p2 = 0;
  var home_faceoffs_p3 = 0;
  var home_faceoffs_ot = 0;

  var home_captain_fights = 0;

  var home_captain_goals_p1 = 0;
  var home_captain_goals_p2 = 0;
  var home_captain_goals_p3 = 0;
  var home_captain_goals_ot = 0;
  var home_captain_goals_so = 0;

  var home_captain_assists_p1 = 0;
  var home_captain_assists_p2 = 0;
  var home_captain_assists_p3 = 0;
  var home_captain_assists_ot = 0;

  var home_lieutenant_fights = 0;
  
  var home_lieutenant_goals_p1 = 0;
  var home_lieutenant_goals_p2 = 0;
  var home_lieutenant_goals_p3 = 0;
  var home_lieutenant_goals_ot = 0;
  var home_lieutenant_goals_so = 0;

  var home_lieutenant_assists_p1 = 0;
  var home_lieutenant_assists_p2 = 0;
  var home_lieutenant_assists_p3 = 0;
  var home_lieutenant_assists_ot = 0;
  
  /** AWAY **/
  var away_shots_p1 = 0;
  var away_shots_p2 = 0;
  var away_shots_p3 = 0;
  var away_shots_ot = 0;

  var away_faceoffs_p1 = 0;
  var away_faceoffs_p2 = 0;
  var away_faceoffs_p3 = 0;
  var away_faceoffs_ot = 0;

  var away_captain_fights = 0;

  var away_captain_goals_p1 = 0;
  var away_captain_goals_p2 = 0;
  var away_captain_goals_p3 = 0;
  var away_captain_goals_ot = 0;
  var away_captain_goals_so = 0;

  var away_captain_assists_p1 = 0;
  var away_captain_assists_p2 = 0;
  var away_captain_assists_p3 = 0;
  var away_captain_assists_ot = 0;

  var away_lieutenant_fights = 0;

  var away_lieutenant_goals_p1 = 0;
  var away_lieutenant_goals_p2 = 0;
  var away_lieutenant_goals_p3 = 0;
  var away_lieutenant_goals_ot = 0;
  var away_lieutenant_goals_so = 0;

  var away_lieutenant_assists_p1 = 0;
  var away_lieutenant_assists_p2 = 0;
  var away_lieutenant_assists_p3 = 0;
  var away_lieutenant_assists_ot = 0;

  /** GLOBAL **/
  var overtime = false;

  /** HOME TEAM **/
  if ((typeof(request.body.home_shots_p1) !== 'undefined') && (!_.isEmpty(request.body.home_shots_p1))) {
    home_shots_p1 = request.body.home_shots_p1;
  }
  if ((typeof(request.body.home_shots_p2) !== 'undefined') && (!_.isEmpty(request.body.home_shots_p2))) {
    home_shots_p2 = request.body.home_shots_p2;
  }
  if ((typeof(request.body.home_shots_p3) !== 'undefined') && (!_.isEmpty(request.body.home_shots_p3))) {
    home_shots_p3 = request.body.home_shots_p3;
  }
  if ((typeof(request.body.home_shots_ot) !== 'undefined') && (!_.isEmpty(request.body.home_shots_ot))) {
    home_shots_ot = request.body.home_shots_ot;
  }

  if ((typeof(request.body.home_faceoffs_p1) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_p1))) {
    home_faceoffs_p1 = request.body.home_faceoffs_p1;
  }
  if ((typeof(request.body.home_faceoffs_p2) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_p2))) {
    home_faceoffs_p2 = request.body.home_faceoffs_p2;
  }
  if ((typeof(request.body.home_faceoffs_p3) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_p3))) {
    home_faceoffs_p3 = request.body.home_faceoffs_p3;
  }
  if ((typeof(request.body.home_faceoffs_ot) !== 'undefined') && (!_.isEmpty(request.body.home_faceoffs_ot))) {
    home_faceoffs_ot = request.body.home_faceoffs_ot;
  }

  /** HOME CAPTAIN **/
  if ((typeof(request.body.home_captain_fights) !== 'undefined') && (!_.isEmpty(request.body.home_captain_fights))) {
    home_captain_fights = request.body.home_captain_fights;
  }

  if ((typeof(request.body.home_captain_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_p1))) {
    home_captain_goals_p1 = request.body.home_captain_goals_p1;
  }
  if ((typeof(request.body.home_captain_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_p2))) {
    home_captain_goals_p2 = request.body.home_captain_goals_p2;
  }
  if ((typeof(request.body.home_captain_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_p3))) {
    home_captain_goals_p3 = request.body.home_captain_goals_p3;
  }
  if ((typeof(request.body.home_captain_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_ot))) {
    home_captain_goals_ot = request.body.home_captain_goals_ot;
  }
  if ((typeof(request.body.home_captain_goals_so) !== 'undefined') && (!_.isEmpty(request.body.home_captain_goals_so))) {
    home_captain_goals_so = request.body.home_captain_goals_so;
  }

  if ((typeof(request.body.home_captain_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_p1))) {
    home_captain_assists_p1 = request.body.home_captain_assists_p1;
  }
  if ((typeof(request.body.home_captain_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_p2))) {
    home_captain_assists_p2 = request.body.home_captain_assists_p2;
  }
  if ((typeof(request.body.home_captain_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_p3))) {
    home_captain_assists_p3 = request.body.home_captain_assists_p3;
  }
  if ((typeof(request.body.home_captain_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.home_captain_assists_ot))) {
    home_captain_assists_ot = request.body.home_captain_assists_ot;
  }

  /** HOME LIEUTENANT **/
  if ((typeof(request.body.home_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_fights))) {
    home_lieutenant_fights = request.body.home_lieutenant_fights;
  }

  if ((typeof(request.body.home_lieutenant_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_p1))) {
    home_lieutenant_goals_p1 = request.body.home_lieutenant_goals_p1;
  }
  if ((typeof(request.body.home_lieutenant_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_p2))) {
    home_lieutenant_goals_p2 = request.body.home_lieutenant_goals_p2;
  }
  if ((typeof(request.body.home_lieutenant_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_p3))) {
    home_lieutenant_goals_p3 = request.body.home_lieutenant_goals_p3;
  }
  if ((typeof(request.body.home_lieutenant_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_ot))) {
    home_lieutenant_goals_ot = request.body.home_lieutenant_goals_ot;
  }
  if ((typeof(request.body.home_lieutenant_goals_so) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_goals_so))) {
    home_lieutenant_goals_so = request.body.home_lieutenant_goals_so;
  }

  if ((typeof(request.body.home_lieutenant_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_p1))) {
    home_lieutenant_assists_p1 = request.body.home_lieutenant_assists_p1;
  }
  if ((typeof(request.body.home_lieutenant_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_p2))) {
    home_lieutenant_assists_p2 = request.body.home_lieutenant_assists_p2;
  }
  if ((typeof(request.body.home_lieutenant_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_p3))) {
    home_lieutenant_assists_p3 = request.body.home_lieutenant_assists_p3;
  }
  if ((typeof(request.body.home_lieutenant_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.home_lieutenant_assists_ot))) {
    home_lieutenant_assists_ot = request.body.home_lieutenant_assists_ot;
  }

   /** AWAY TEAM **/
  if ((typeof(request.body.away_shots_p1) !== 'undefined') && (!_.isEmpty(request.body.away_shots_p1))) {
    away_shots_p1 = request.body.away_shots_p1;
  }
  if ((typeof(request.body.away_shots_p2) !== 'undefined') && (!_.isEmpty(request.body.away_shots_p2))) {
    away_shots_p2 = request.body.away_shots_p2;
  }
  if ((typeof(request.body.away_shots_p3) !== 'undefined') && (!_.isEmpty(request.body.away_shots_p3))) {
    away_shots_p3 = request.body.away_shots_p3;
  }
  if ((typeof(request.body.away_shots_ot) !== 'undefined') && (!_.isEmpty(request.body.away_shots_ot))) {
    away_shots_ot = request.body.away_shots_ot;
  }

  if ((typeof(request.body.away_faceoffs_p1) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_p1))) {
    away_faceoffs_p1 = request.body.away_faceoffs_p1;
  }
  if ((typeof(request.body.away_faceoffs_p2) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_p2))) {
    away_faceoffs_p2 = request.body.away_faceoffs_p2;
  }
  if ((typeof(request.body.away_faceoffs_p3) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_p3))) {
    away_faceoffs_p3 = request.body.away_faceoffs_p3;
  }
  if ((typeof(request.body.away_faceoffs_ot) !== 'undefined') && (!_.isEmpty(request.body.away_faceoffs_ot))) {
    away_faceoffs_ot = request.body.away_faceoffs_ot;
  }

  /** AWAY CAPTAIN **/
  if ((typeof(request.body.away_captain_fights) !== 'undefined') && (!_.isEmpty(request.body.away_captain_fights))) {
    away_captain_fights = request.body.away_captain_fights;
  }

  if ((typeof(request.body.away_captain_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_p1))) {
    away_captain_goals_p1 = request.body.away_captain_goals_p1;
  }
  if ((typeof(request.body.away_captain_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_p2))) {
    away_captain_goals_p2 = request.body.away_captain_goals_p2;
  }
  if ((typeof(request.body.away_captain_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_p3))) {
    away_captain_goals_p3 = request.body.away_captain_goals_p3;
  }
  if ((typeof(request.body.away_captain_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_ot))) {
    away_captain_goals_ot = request.body.away_captain_goals_ot;
  }
  if ((typeof(request.body.away_captain_goals_so) !== 'undefined') && (!_.isEmpty(request.body.away_captain_goals_so))) {
    away_captain_goals_so = request.body.away_captain_goals_so;
  }

  if ((typeof(request.body.away_captain_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_p1))) {
    away_captain_assists_p1 = request.body.away_captain_assists_p1;
  }
  if ((typeof(request.body.away_captain_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_p2))) {
    away_captain_assists_p2 = request.body.away_captain_assists_p2;
  }
  if ((typeof(request.body.away_captain_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_p3))) {
    away_captain_assists_p3 = request.body.away_captain_assists_p3;
  }
  if ((typeof(request.body.away_captain_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.away_captain_assists_ot))) {
    away_captain_assists_ot = request.body.away_captain_assists_ot;
  }

  /** AWAY LIEUTENANT **/
  if ((typeof(request.body.away_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_fights))) {
    away_lieutenant_fights = request.body.away_lieutenant_fights;
  }

  if ((typeof(request.body.away_lieutenant_goals_p1) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_p1))) {
    away_lieutenant_goals_p1 = request.body.away_lieutenant_goals_p1;
  }
  if ((typeof(request.body.away_lieutenant_goals_p2) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_p2))) {
    away_lieutenant_goals_p2 = request.body.away_lieutenant_goals_p2;
  }
  if ((typeof(request.body.away_lieutenant_goals_p3) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_p3))) {
    away_lieutenant_goals_p3 = request.body.away_lieutenant_goals_p3;
  }
  if ((typeof(request.body.away_lieutenant_goals_ot) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_ot))) {
    away_lieutenant_goals_ot = request.body.away_lieutenant_goals_ot;
  }
  if ((typeof(request.body.away_lieutenant_goals_so) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_goals_so))) {
    away_lieutenant_goals_so = request.body.away_lieutenant_goals_so;
  }

  if ((typeof(request.body.away_lieutenant_assists_p1) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_p1))) {
    away_lieutenant_assists_p1 = request.body.away_lieutenant_assists_p1;
  }
  if ((typeof(request.body.away_lieutenant_assists_p2) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_p2))) {
    away_lieutenant_assists_p2 = request.body.away_lieutenant_assists_p2;
  }
  if ((typeof(request.body.away_lieutenant_assists_p3) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_p3))) {
    away_lieutenant_assists_p3 = request.body.away_lieutenant_assists_p3;
  }
  if ((typeof(request.body.away_lieutenant_assists_ot) !== 'undefined') && (!_.isEmpty(request.body.away_lieutenant_assists_ot))) {
    away_lieutenant_assists_ot = request.body.away_lieutenant_assists_ot;
  }

  /** RUN cloud code **/

  Parse.Cloud.run('savePOGameResult', { 
    game_id: game_id,
    home_shots_p1: home_shots_p1.toString(),
    home_shots_p2: home_shots_p2.toString(),
    home_shots_p3: home_shots_p3.toString(),
    home_shots_ot: home_shots_ot.toString(),
    home_faceoffs_p1: home_faceoffs_p1.toString(),
    home_faceoffs_p2: home_faceoffs_p2.toString(),
    home_faceoffs_p3: home_faceoffs_p3.toString(),
    home_faceoffs_ot: home_faceoffs_ot.toString(),
    home_captain_fights: home_captain_fights.toString(),
    home_captain_goals_p1: home_captain_goals_p1.toString(),
    home_captain_goals_p2: home_captain_goals_p2.toString(),
    home_captain_goals_p3: home_captain_goals_p3.toString(),
    home_captain_goals_ot: home_captain_goals_ot.toString(),
    home_captain_goals_so: home_captain_goals_so.toString(),
    home_captain_assists_p1: home_captain_assists_p1.toString(),
    home_captain_assists_p2: home_captain_assists_p2.toString(),
    home_captain_assists_p3: home_captain_assists_p3.toString(),
    home_captain_assists_ot: home_captain_assists_ot.toString(),
    home_lieutenant_fights: home_lieutenant_fights.toString(),
    home_lieutenant_goals_p1: home_lieutenant_goals_p1.toString(),
    home_lieutenant_goals_p2: home_lieutenant_goals_p2.toString(),
    home_lieutenant_goals_p3: home_lieutenant_goals_p3.toString(),
    home_lieutenant_goals_ot: home_lieutenant_goals_ot.toString(),
    home_lieutenant_goals_so: home_lieutenant_goals_so.toString(),
    home_lieutenant_assists_p1: home_lieutenant_assists_p1.toString(),
    home_lieutenant_assists_p2: home_lieutenant_assists_p2.toString(),
    home_lieutenant_assists_p3: home_lieutenant_assists_p3.toString(),
    home_lieutenant_assists_ot: home_lieutenant_assists_ot.toString(),
    away_shots_p1: away_shots_p1.toString(),
    away_shots_p2: away_shots_p2.toString(),
    away_shots_p3: away_shots_p3.toString(),
    away_shots_ot: away_shots_ot.toString(),
    away_faceoffs_p1: away_faceoffs_p1.toString(),
    away_faceoffs_p2: away_faceoffs_p2.toString(),
    away_faceoffs_p3: away_faceoffs_p3.toString(),
    away_faceoffs_ot: away_faceoffs_ot.toString(),
    away_captain_fights: away_captain_fights.toString(),
    away_captain_goals_p1: away_captain_goals_p1.toString(),
    away_captain_goals_p2: away_captain_goals_p2.toString(),
    away_captain_goals_p3: away_captain_goals_p3.toString(),
    away_captain_goals_ot: away_captain_goals_ot.toString(),
    away_captain_goals_so: away_captain_goals_so.toString(),
    away_captain_assists_p1: away_captain_assists_p1.toString(),
    away_captain_assists_p2: away_captain_assists_p2.toString(),
    away_captain_assists_p3: away_captain_assists_p3.toString(),
    away_captain_assists_ot: away_captain_assists_ot.toString(),
    away_lieutenant_fights: away_lieutenant_fights.toString(),
    away_lieutenant_goals_p1: away_lieutenant_goals_p1.toString(),
    away_lieutenant_goals_p2: away_lieutenant_goals_p2.toString(),
    away_lieutenant_goals_p3: away_lieutenant_goals_p3.toString(),
    away_lieutenant_goals_ot: away_lieutenant_goals_ot.toString(),
    away_lieutenant_goals_so: away_lieutenant_goals_so.toString(),
    away_lieutenant_assists_p1: away_lieutenant_assists_p1.toString(),
    away_lieutenant_assists_p2: away_lieutenant_assists_p2.toString(),
    away_lieutenant_assists_p3: away_lieutenant_assists_p3.toString(),
    away_lieutenant_assists_ot: away_lieutenant_assists_ot.toString()
  }).then(function(result){
    var info_msg = encodeURIComponent("Resultat för match med id '" + game_id + "' är sparat med lyckat resultat!");
    response.redirect('/playoffs/game/' + game_id + '?info=' + info_msg);
  }, function(error){
    var error_msg = encodeURIComponent("Fel uppstod när resultat skulle sparas. Meddelande: '" + error.message + "'");
    response.redirect('/playoffs/game/' + game_id + '?error=' + error_msg);
  });
};