var _ = require('underscore');
// Display the homepage.
exports.index = function(req, res) {
  var passedErrorVariable = req.query.error;
  var passedWarningVariable = req.query.warning;
  var passedInfoVariable = req.query.info;

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
        flashError: passedErrorVariable,
        flashWarning: passedWarningVariable,
        flashInfo: passedInfoVariable
      });
    } else {
      var count = 0;
      console.log("count: " + count);
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