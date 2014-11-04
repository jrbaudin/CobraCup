var Mailgun = require('mailgun');
Mailgun.initialize('mg.skipool.nu', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

// Display a form for creating a new instructor.
exports.new = function(req, res) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.count({
    success: function(number) {
      if(number <=14){
        var NHLTeam = Parse.Object.extend('NHLTeam');
        var nhlTeamQuery = new Parse.Query(NHLTeam);
        nhlTeamQuery.descending('name');
        nhlTeamQuery.find().then(function(nhlteams) {
          if (nhlteams) {
            res.render('signup', { 
              nhlteams: nhlteams
            });
          } else {
            res.render('signup', {});
          }
        },
        function() {
          res.send(500, 'Failed finding teams');
        });
      } else {
        var Team = Parse.Object.extend('Team');
        var teamQuery = new Parse.Query(Team);
        teamQuery.descending('createdAt');
        teamQuery.find().then(function(teams) {
          if (teams) {
            res.render('hub', { 
              teams: teams
            });
          } else {
            res.render('hub', {flash: 'Inga lag är ännu registrerade.'});
          }
        },
        function() {
          res.send(500, 'Failed finding teams');
        });
      }
    },
    error: function(error) {
      res.send(500, 'Failed getting a count of the teams');
    }
  });
};


// Create a new team with specified information.
exports.create = function(req, res) {
  var captain_name = req.body.captain_name;
  var captain_email = req.body.captain_email;
  var captain_telephone = req.body.captain_telephone;

  var lieutenant_name = req.body.lieutenant_name;
  var lieutenant_email = req.body.lieutenant_email;
  var lieutenant_telephone = req.body.lieutenant_telephone;

  var team_name = req.body.team_name;

  var nhlTeam_name = req.body.nhlTeam_name;
  var nhlTeam_id = req.body.nhlTeam_id;

  var level = req.body.level;

  var comment = req.body.comment

  var Team = Parse.Object.extend("Team");
  var team = new Team();

  var NHLTeam = Parse.Object.extend('NHLTeam');
  var nhlTeam = new NHLTeam();
  nhlTeam.id = nhlTeam_id;
   
  team.set("nhlTeam", nhlTeam);

  team.set('captain_name', captain_name);
  team.set('captain_email', captain_email);
  team.set('captain_telephone', captain_telephone);

  team.set('lieutenant_name', lieutenant_name);
  team.set('lieutenant_email', lieutenant_email);
  team.set('lieutenant_telephone', lieutenant_telephone);

  team.set('team_name', team_name);

  team.set('level', level);

  team.set('comment', comment);

  team.save().then(function(team) {
    console.log('Managed to save the team... yippiee');
    Mailgun.sendEmail({
      to: captain_name + " <" + captain_email + ">",
      from: "Cobra Cup 2015 <joel@cobracup.se>",
      subject: "Ditt lag " + team_name + " är nu anmält till Cobra Cup 2015!",
      html: "<html><h3>Din anmälan till Cobra Cup 2015 är klar!</h3> <p>Det här är ett automatiskt genererat mail för att meddela dig att din anmälan har gått igenom.</p> <p>Dina uppgifter är:<br> Kapten: <b>" + captain_email + "</b><br>Assisterande: <b>" + lieutenant_name + "</b><br>Lagnamn: <b>" + team_name + "</b><br>Spelar med: <b>" + nhlTeam_name + "</b></p><p>Tack för att du använder dig av denna sida!<br><br>Med vänlig hälsning<br>Joel<br>www.cobracup.se</p></html>"
    }, {
      success: function(httpResponse) {
        console.log('SendEmail success response: ' + httpResponse);
        var string = encodeURIComponent(team.get("team_name") + ' är nu sparad i databasen!');
        res.redirect('/?info=' + string);
      },
      error: function(httpResponse) {
        console.error('SendEmail error response: ' + httpResponse);
        var string = encodeURIComponent(team.get("team_name") + ' är nu sparad i databasen!');
        res.redirect('/?info=' + string);
      }
    });
  }, function(error) {
    // Show the error message and let the user try again
    console.error('Error saving the new team, try again.');
    console.error(error);
    res.render('signup', {flash: error.message});
  });
};