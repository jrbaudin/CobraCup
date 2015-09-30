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
      if(number <=19){
        var NHLTeam = Parse.Object.extend('NHLTeam');
        var nhlTeamQuery = new Parse.Query(NHLTeam);
        nhlTeamQuery.ascending('name');
        //nhlTeamQuery.notEqualTo("taken", true);
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
        var passedWarningVariable = "Alla platser för Cobra Cup 2016 är bokade!";
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
  var captain_gamertag = req.body.captain_gamertag;

  var lieutenant_name = req.body.lieutenant_name;
  var lieutenant_email = req.body.lieutenant_email;
  var lieutenant_telephone = req.body.lieutenant_telephone;
  var lieutenant_gamertag = req.body.lieutenant_gamertag;

  var team_name = req.body.team_name;
  var team_motto = req.body.team_motto;
  var nhlTeam = req.body.nhlTeam;
  var level = req.body.level;
  var comment = req.body.comment

  var legend = ["-","-","-"];
  var marathon = ["-","-","-"];

  var Team = Parse.Object.extend("Team");
  var team = new Team();

  var NHLTeam = Parse.Object.extend("NHLTeam");
  var nhlTeamObj = new NHLTeam();
  nhlTeamObj.id = nhlTeam;

  team.set("nhlTeam", nhlTeamObj);

  team.set("legend", legend);
  team.set("marathon", marathon);

  team.set('captain_name', captain_name);
  team.set('captain_email', captain_email);
  team.set('captain_telephone', captain_telephone);

  var capId = Math.floor((Math.random() * 100000) + 1);
  team.set('captain_id', capId.toString());

  team.set('lieutenant_name', lieutenant_name);
  team.set('lieutenant_email', lieutenant_email);
  team.set('lieutenant_telephone', lieutenant_telephone);

  var lieuId = Math.floor((Math.random() * 100000) + 1);
  team.set('lieutenant_id', lieuId.toString());

  if (_.isEmpty(lieutenant_gamertag)) {lieutenant_gamertag = "-"};
  if (_.isEmpty(captain_gamertag)) {captain_gamertag = "-"};

  team.set('captain_gamertag', captain_gamertag);
  team.set('lieutenant_gamertag', lieutenant_gamertag);

  team.set('team_name', team_name);
  team.set('team_motto', team_motto);
  team.set('level', level);
  team.set('comment', comment);

  team.set('group', "0");

  team.set('qualified', false);
  team.set('champion', false);

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
            var Standing = Parse.Object.extend("Standings");
            var standing = new Standing();

            standing.set('team', saved_team);
            standing.set('points', 0);
            standing.set('games_played', 0);
            standing.set('wins', 0);
            standing.set('tie', 0);
            standing.set('losses', 0);
            standing.set('goals_for', 0);
            standing.set('goals_against', 0);
            standing.save().then(function(standing) {
              var captain_name = saved_team.get("captain_name");
              var lieutenant_name = saved_team.get("lieutenant_name");

              var PlayerStats = Parse.Object.extend("PlayerStats");

              var playerStatCaptain = new PlayerStats();

              playerStatCaptain.set('player_name', captain_name);
              playerStatCaptain.set('player_id', capId.toString());
              playerStatCaptain.set('player_team', saved_team);
              playerStatCaptain.set('player_goals', 0);
              playerStatCaptain.set('player_fights', 0);
              playerStatCaptain.save().then(function(playerStat) {
                console.log("Successfully saved CAPTAIN player stat object");
              }, function(error) {
                console.error("Failed saving CAPTAIN player stat object");
                console.error(error);
              });

              var playerStatLieutenant = new PlayerStats();

              playerStatLieutenant.set('player_name', lieutenant_name);
              playerStatLieutenant.set('player_id', lieuId.toString());
              playerStatLieutenant.set('player_team', saved_team);
              playerStatLieutenant.set('player_goals', 0);
              playerStatLieutenant.set('player_fights', 0);
              playerStatLieutenant.save().then(function(playerStat) {
                console.log("Successfully saved LIEUTENANT player stat object");
              }, function(error) {
                console.error("Failed saving LIEUTENANT player stat object");
                console.error(error);
              });

              var passedInfoVariable = "Ditt lag är nu sparat. Lycka till!";
              var Team = Parse.Object.extend('Team');
              var teamQuery = new Parse.Query(Team);
              teamQuery.descending('createdAt');
              teamQuery.include('nhlTeam');
              teamQuery.find().then(function(teams) {
                if (teams) {
                  Mailgun.sendEmail({
                    to: captain_name + " <" + captain_email + ">; Joel Baudin <joel.baudin88@gmail.com>; " + lieutenant_name + " <" + lieutenant_email + ">",
                    from: "Cobra Cup 2016 <joel@cobracup.se>",
                    subject: "Ditt lag " + team_name + " är nu anmält till Cobra Cup 2016!",
                    html: "<html><h3>Er anmälan till Cobra Cup 2016 är klar!</h3> <p>Det här är ett automatiskt genererat mail som skickas till båda lagmedlemmarna för att meddela att anmälan har gått igenom.</p><p>Era uppgifter är:<br> Kapten: <b>" + captain_name + "</b><br>Assisterande: <b>" + lieutenant_name + "</b><br>Lagnamn: <b>" + team_name + "</b><br><br>Ert lösenord är <b>" + pass + "</b></p><p><h3>Viktig information</h3>Som ni kanske sett så har vi en anmälningsavgift för att vara med på Cobra Cup. Denna avgift är till för att täcka hyra av lokal, middag till alla deltagare samt priser.<br>Denna avgift ligger på <b>200 kr</b> per person och ska vara betald en vecka innan Cobra Cup dvs. 12 december 2015. <b>Obs.</b> Om denna avgift på 200 kr /person (400 kr /lag) <u>inte</u> är betald i tid tappar laget sin plats i turneringen.<br><br>Betalning sker enklast via Swish till <b>070 566 64 21</b>. Märk din betalning med lagnamn.<br>Om du/ni inte har Swish eller inte vill använda er av det ber jag er kontakta mig för att få kontonummer.<br><br>Om det är några frågor tveka inte att kontakta oss på joel@cobracup.se.</p><p>Tack för att du använder dig av denna sida men mer än det, tack för att du vill vara med på Cobra Cup!<br><br>Med vänlig hälsning<br>Joel & David<br>www.cobracup.se</p></html>"
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
                res.render('hub', {flash: 'Problem när de anmälda lagen skulle hämtas.'});
              });
            }, function(error) {
              // Show the error message and let the user try again
              console.error('Error adding the row in standings tabl, try again.');
              console.error(error);
              res.render('signup', {flash: error.message});
            });
          } else {
            res.send(500, 'Could not update taken status for the NHL Team');
          }
        }, function(error) {
          // Show the error message and let the user try again
          console.error('Error updating the taken status for the NHL Team, try again.');
          console.error(error);
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
