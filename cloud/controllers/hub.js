var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

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
      res.render('hub', { 
        teams: teams,
        flashError: passedErrorVariable,
        flashWarning: passedWarningVariable,
        flashInfo: passedInfoVariable
      });
    } else {
      res.render('hub', {
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