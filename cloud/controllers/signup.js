var _ = require('underscore');
var Mailgun = require('mailgun');
Mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

// Display a form for creating a new instructor.
exports.new = function(req, res) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.count({
    success: function(number) {
      console.log("number: " + number);
      if(number <=14){
        var NHLTeam = Parse.Object.extend('NHLTeam');
        var nhlTeamQuery = new Parse.Query(NHLTeam);
        nhlTeamQuery.ascending('name');
        nhlTeamQuery.notEqualTo("taken", true);
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
        var passedWarningVariable = "Alla platser för Cobra Cup 2015 är bokade!";
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
              flashWarning: passedWarningVariable
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
  var team_motto = req.body.team_motto;
  var nhlTeam = req.body.nhlTeam;
  var level = req.body.level;
  var comment = req.body.comment

  var Team = Parse.Object.extend("Team");
  var team = new Team();

  var NHLTeam = Parse.Object.extend("NHLTeam");
  var nhlTeamObj = new NHLTeam();
  nhlTeamObj.id = nhlTeam;

  team.set("nhlTeam", nhlTeamObj);

  team.set('captain_name', captain_name);
  team.set('captain_email', captain_email);
  team.set('captain_telephone', captain_telephone);

  team.set('lieutenant_name', lieutenant_name);
  team.set('lieutenant_email', lieutenant_email);
  team.set('lieutenant_telephone', lieutenant_telephone);

  team.set('team_name', team_name);
  team.set('team_motto', team_motto);
  team.set('level', level);
  team.set('comment', comment);

  var pass = Math.random().toString(36).slice(-8);
  team.set('password', pass);

  var genId = Math.floor((Math.random() * 100000) + 1);
  team.set('team_id', genId.toString());

  team.save().then(function(saved_team) {
    var NHLTeamToSave = Parse.Object.extend('NHLTeam');
    var nhlTeamQuery = new Parse.Query(NHLTeamToSave);
    nhlTeamQuery.equalTo('objectId', nhlTeam);
    nhlTeamQuery.find().then(function(nhlTeamToUpdate) {
      if (nhlTeamToUpdate) {
        nhlTeamToUpdate[0].set('taken', true);

        nhlTeamToUpdate[0].save().then(function(saved_nhlteam) {
          if(saved_nhlteam){
            var passedInfoVariable = "Ditt lag är nu sparat. Lycka till!";
            var Team = Parse.Object.extend('Team');
            var teamQuery = new Parse.Query(Team);
            teamQuery.descending('createdAt');
            teamQuery.include('nhlTeam');
            teamQuery.find().then(function(teams) {
              if (teams) {
                Mailgun.sendEmail({
                  to: captain_name + " <" + captain_email + ">; Joel Baudin <joel.baudin88@gmail.com>",
                  from: "Cobra Cup 2015 <joel@cobracup.se>",
                  subject: "Ditt lag " + team_name + " är nu anmält till Cobra Cup 2015!",
                  html: "<html><h3>Din anmälan till Cobra Cup 2015 är klar!</h3> <p>Det här är ett automatiskt genererat mail för att meddela dig att din anmälan har gått igenom.</p><p>Dina uppgifter är:<br> Kapten: <b>" + captain_name + "</b><br>Assisterande: <b>" + lieutenant_name + "</b><br>Lagnamn: <b>" + team_name + "</b><br><br>Ditt lösenord är <b>" + pass + "</b></p><p><h3>Viktig information</h3>Som ni kanske sett så är det i år en anmälningsavgift för att vara med på Cobra Cup. Denna avgift är till för att täcka hyra av lokal, middag till alla deltagare samt priser.<br>Denna avgift ligger på <b>150 kr</b> per person och ska vara betald en vecka innan Cobra Cup dvs. 15 december 2014. <b>Obs.</b> Om denna avgift på 150 kr /person (300 kr /lag) <u>inte</u> är betald i tid tappar laget sin plats i turneringen.<br><br>Betalning sker enklast via Swish till <b>070 566 64 21</b>. Märk din betalning med lagnamn.<br>Om du/ni inte har Swish eller inte vill använda er av det ber jag er kontakta mig för att få kontonummer.<br><br>Om det är några frågor tveka inte att kontakta oss på joel@cobracup.se.</p><p>Tack för att du använder dig av denna sida men mer än det, tack för att du vill vara med på Cobra Cup!<br><br>Med vänlig hälsning<br>Joel & David<br>www.cobracup.se</p></html>"
                }, {
                  success: function(httpResponse) {
                    console.log('SendEmail success response: ' + httpResponse);
                    var count = _.size(teams);
                    console.log("count: " + count);
                    res.render('hub', { 
                      teams: teams,
                      count: count,
                      flashInfo: passedInfoVariable
                    });
                  },
                  error: function(httpResponse) {
                    console.error('SendEmail error response: ' + httpResponse);
                    var count = _.size(teams);
                    console.log("count: " + count);
                    res.render('hub', { 
                      teams: teams,
                      count: count,
                      flashInfo: passedInfoVariable
                    });
                  }
                });
              } else {
                res.render('hub', {flash: 'Inga lag är ännu registrerade.'});
              }
            },
            function(error) {
              console.error('Error find teams to send to The Hub');
              console.error(error);
              console.error(error.message);
              res.render('hub', {flash: 'Problem när de anmälda lagen skulle hämtas.'});
            });
          } else {
            res.send(500, 'Could not update taken status for the NHL Team');
          }
        }, function(error) {
          // Show the error message and let the user try again
          console.error('Error updating the taken status for the NHL Team, try again.');
          console.error(error);
          console.error(error.message);
          res.render('signup', {flash: error.message});
        });
      } else {
        console.error('The NHL Team object was undefined.');
        res.render('signup', {flash: "Det var problem på sidan. Pröva kontakta en administratör."});
      }
    },
    function(error) {
      console.error('Could not find the NHL Team to update. Contact your administrator.');
      console.error(error);
      res.render('signup', {flash: error.message});
    });
  }, function(error) {
    // Show the error message and let the user try again
    console.error('Error saving the new team, try again.');
    console.error(error);
    res.render('signup', {flash: error.message});
  });
};