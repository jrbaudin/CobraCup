var _ = require('underscore');
// Display the homepage.
exports.index = function(req, res) {
  var passedErrorVariable = req.query.error;
  var passedWarningVariable = req.query.warning;
  var passedInfoVariable = req.query.info;
  var passedIdVariable = req.query.id;

  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.ascending('team_name');
  teamQuery.equalTo('hidden', false);
  teamQuery.include('nhlTeam');
  teamQuery.find().then(function(teams) {
    if (teams) {
      var count = _.size(teams);
      var countData = _.countBy(teams, function(team){
          return team.get("level");
      }); 

      res.render('hub', {
        teams: teams,
        count: count,
        teamCount: countData,
        flashError: passedErrorVariable,
        flashWarning: passedWarningVariable,
        flashInfo: passedInfoVariable,
        flashGameId: passedIdVariable
      });
    } else {
      var count = 0;
      res.render('hub', {
        count: count,
        flash: 'Inga lag är ännu registrerade.',
        flashError: passedErrorVariable,
        flashWarning: passedWarningVariable,
        flashInfo: passedInfoVariable
      });
    }
  },
  function() {
    res.send(500, 'Failed finding teams');
  });
};