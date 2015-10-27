require('cloud/app.js');
var _ = require('underscore');
var twitter = require('cloud/modules/twitter.js');
var mailgun = require('mailgun');
mailgun.initialize('mg.cobracup.se', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

Parse.Cloud.define("sendTweet", function(request, response) {
  	twitter.request({
        url: 'statuses/update',
        params: {
          status: request.params.status
        }
    }).then(function(httpResponse) {
        //console.log('sendTweet(): ' + httpResponse.text);
        response.success("Tweet succesfully sent");
    }, function(httpResponse) {
        console.log('sendTweet(): Request failed with response code ' + httpResponse.status);
        console.log('sendTweet(): Response text: ' + httpResponse.text);
        response.error('Sending Tweet failed with response code ' + httpResponse.status);
    });
});

Parse.Cloud.define("getTeams", function(request, response) {
    var Team = Parse.Object.extend('Team');
    var teamsQuery = new Parse.Query(Team);
    teamsQuery.include(['nhlTeam','captain','lieutenant']);
    teamsQuery.find().then(function(results) {
        response.success(results);                            
    }, function(error) {
      response.error("Teams retrieval failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.define("getPlayers", function(request, response) {
    var Player = Parse.Object.extend('Player');
    var playersQuery = new Parse.Query(Player);
    playersQuery.include('team');
    playersQuery.find().then(function(results) {
        response.success(results);                            
    }, function(error) {
      response.error("Players retrieval failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.define("createPlayer", function(request, response) {
    var Player = Parse.Object.extend("Player");
    var player = new Player();

    player.set('name', request.params.name);
    player.set('email', request.params.email);
    player.set('gamertag', request.params.gamertag);
    player.set('telephone', request.params.telephone);
    player.set('fights', 0);
    player.set('goals', 0);
    var playerId = Math.floor((Math.random() * 100000) + 1);
    player.set('player_id', playerId.toString());

    player.save().then(function(result) {
        response.success("Saved the Player with objectId = " + result.id);
    }, function(error) {
        response.error('Error saving Player, try again. Msg: ' + error.message);
    });
});

Parse.Cloud.define("getPlayer", function(request, response) {
  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.equalTo('player_id', request.params.player_id);
  playerQuery.include('team');
  playerQuery.find().then(function(result) {
    if(typeof(result[0].id) !== 'undefined'){
      console.log("main.js.getPlayer(): Found player with objectId = " + result[0].id);

      response.success(result);
    } else {
      console.log("main.js.getPlayer(): No Player with id " + request.params.player_id + " was found");
      response.error("No Player with id " + request.params.player_id + " was found");
    }
  }, function(error) {
    console.log("main.js.getPlayer(): Player retrieval failed with error.code " + error.code + " error.message " + error.message);
    response.error("Player retrieval failed with error.code " + error.code + " error.message " + error.message);
  });
});

Parse.Cloud.define("updatePlayer", function(request, response) {
  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.equalTo('player_id', request.params.player_id);
  playerQuery.find().then(function(result) {

    var promise = Parse.Promise.as();

    if ((typeof(request.params.email) !== 'undefined') && (!_.isEmpty(request.params.email))) {
      result[0].set('email',request.params.email);
    }
    if ((typeof(request.params.telephone) !== 'undefined') && (!_.isEmpty(request.params.telephone))) {
      result[0].set('telephone',request.params.telephone);
    }
    if ((typeof(request.params.birthyear) !== 'undefined') && (!_.isEmpty(request.params.birthyear))) {
      result[0].set('birthyear',request.params.birthyear);
    }
    if ((typeof(request.params.birthplace) !== 'undefined') && (!_.isEmpty(request.params.birthplace))) {
      result[0].set('birthplace',request.params.birthplace);
    }
    if ((typeof(request.params.nation) !== 'undefined') && (!_.isEmpty(request.params.nation))) {
      result[0].set('nation',request.params.nation);
    }
    if ((typeof(request.params.position) !== 'undefined') && (!_.isEmpty(request.params.position))) {
      result[0].set('position',request.params.position);
    }
    if ((typeof(request.params.shoots) !== 'undefined') && (!_.isEmpty(request.params.shoots))) {
      result[0].set('shoots',request.params.shoots);
    }
    if ((typeof(request.params.profile) !== 'undefined') && (!_.isEmpty(request.params.profile))) {
      result[0].set('profile',request.params.profile);
    }
    if ((typeof(request.params.twitter) !== 'undefined') && (!_.isEmpty(request.params.twitter))) {
      result[0].set('twitter',request.params.twitter);
    }
    if ((typeof(request.params.facebook) !== 'undefined') && (!_.isEmpty(request.params.facebook))) {
      result[0].set('facebook',request.params.facebook);
    }
    if ((typeof(request.params.gamertag) !== 'undefined') && (!_.isEmpty(request.params.gamertag))) {
      result[0].set('gamertag',request.params.gamertag);
    }

    promise = promise.then(function() {
      return result[0].save();
    });

    return promise;

  }).then(function(result) {
    response.success(result);
  }, function(error) {
    response.error("Updating Player failed with error.code " + error.code + " error.message " + error.message);
  });
});

Parse.Cloud.define("sendPasswordToUser", function(request, response) {
  var emailPromises = [];

  var i = 0;

  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.equalTo('player_id', request.params.player_id);
  playerQuery.find().then(function(results) {
    _.each(results, function(result) {

      var emailPromise = mailgun.sendEmail({
        to: result.get("name") + " <" + result.get("email") + ">",
        from: "Cobra Hub <joel@cobracup.se>",
        subject: "Här är ditt lösenord!",
        html: "<html><h3>Ditt lösenord</h3><p>Här kommer ditt lösenord som du kan använda för att uppdatera din information på <a href='http://www.hub.cobracup.se'>hub.cobracup.se</a></p><p>Ditt lösenord är <b>" + result.get("password") + "</b></p><p>- Cobra HQ</p></html>"
      });

      emailPromises.push(emailPromise);

      i=i+1;

    });

    return Parse.Promise.when(emailPromises);;

  }).then(function() {
    response.success("Sent password to " + i + " players");
  });
});

Parse.Cloud.define("sendPassword", function(request, response) {
  var emailPromises = [];

  var i = 0;

  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  //playerQuery.equalTo('player_id', "36652");
  playerQuery.find().then(function(results) {
    _.each(results, function(result) {

      var emailPromise = mailgun.sendEmail({
        to: result.get("name") + " <" + result.get("email") + ">",
        from: "Cobra Hub <joel@cobracup.se>",
        subject: "Här är ditt lösenord!",
        html: "<html><h3>Ditt lösenord</h3><p>Här kommer ditt lösenord som du kan använda för att uppdatera din information på <a href='http://www.hub.cobracup.se'>hub.cobracup.se</a></p><p>Ditt lösenord är <b>" + result.get("password") + "</b></p><p>- Cobra HQ</p></html>"
      });

      emailPromises.push(emailPromise);

      i=i+1;

    });

    return Parse.Promise.when(emailPromises);;

  }).then(function() {
    response.success("Sent password to " + i + " players");
  });
});

Parse.Cloud.define("createPlayerPass", function(request, response) {
  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.find().then(function(results) {
    var promise = Parse.Promise.as();
    _.each(results, function(result) {

      var pass = Math.random().toString(36).slice(-8);
      result.set('password', pass);

      promise = promise.then(function() {
        return result.save();
      });
    });

    return promise;

  }).then(function() {
    response.success("Added player passwords");
  });
});

/*** START Create PRO/ALLSTAR Team ***/
Parse.Cloud.define("createTeam", function(request, response) {
    var Team = Parse.Object.extend("Team");
    var Player = Parse.Object.extend("Player");

    var team = new Team();

    var captain_name = request.params.captain_name;
    var captain_email = request.params.captain_email;
    var captain_telephone = request.params.captain_telephone;
    var captain_gamertag = request.params.captain_gamertag;

    var lieutenant_name = request.params.lieutenant_name;
    var lieutenant_email = request.params.lieutenant_email;
    var lieutenant_telephone = request.params.lieutenant_telephone;
    var lieutenant_gamertag = request.params.lieutenant_gamertag;

    var team_name = request.params.team_name;
    var team_motto = request.params.team_motto;
    var nhlTeam = request.params.nhlTeam;
    var level = request.params.level;
    var comment = request.params.comment;
    var hidden = request.params.hidden;

    var NHLTeam = Parse.Object.extend("NHLTeam");
    var nhlTeamObj = new NHLTeam();
    nhlTeamObj.id = nhlTeam;

    team.set("nhlTeam", nhlTeamObj);

    var legend = ["-","-","-"];
    var marathon = ["-","-","-"];

    team.set("legend", legend);
    team.set("marathon", marathon);

    team.set('team_name', team_name);
    team.set('team_motto', team_motto);
    team.set('level', level);
    team.set('comment', comment);

    team.set('group', "0");

    team.set('qualified', false);
    team.set('champion', false);
    team.set('champion_comment', "");

    var pass = Math.random().toString(36).slice(-8);
    team.set('password', pass);

    var genId = Math.floor((Math.random() * 100000) + 1);
    team.set('team_id', genId.toString());

    if (_.isEmpty(hidden)) {hidden = false};
    if(hidden === "true"){
        hidden = true;
    } else {
        hidden = false;
    }

    team.set('hidden', hidden);

    //Create Captain object
    var captain = new Player();
    captain.set('name', captain_name);
    captain.set('email', captain_email);
    captain.set('telephone', captain_telephone);

    if (_.isEmpty(captain_gamertag)) {captain_gamertag = "-"};
    captain.set('gamertag', captain_gamertag);

    var capId = Math.floor((Math.random() * 100000) + 1);
    captain.set('player_id', capId.toString());

    captain.set('fights', 0);
    captain.set('goals', 0);
    captain.set('assists', 0);
    captain.set('points', 0);

    var pass1 = Math.random().toString(36).slice(-8);
    captain.set('password', pass1);

    //Create Lieutenant object
    var lieutenant = new Player();
    lieutenant.set('name', lieutenant_name);
    lieutenant.set('email', lieutenant_email);
    lieutenant.set('telephone', lieutenant_telephone);

    if (_.isEmpty(lieutenant_gamertag)) {lieutenant_gamertag = "-"};
    lieutenant.set('gamertag', lieutenant_gamertag);

    var lieuId = Math.floor((Math.random() * 100000) + 1);
    lieutenant.set('player_id', lieuId.toString());

    lieutenant.set('fights', 0);
    lieutenant.set('goals', 0);
    lieutenant.set('assists', 0);
    lieutenant.set('points', 0);

    var pass2 = Math.random().toString(36).slice(-8);
    lieutenant.set('password', pass2);

    var teamObj;
    var savedCaptain; 
    var savedLieutenant;

    //Save the Captain
    captain.save().then(function(result) {
        //add a Pointer to the Captain on the Team
        team.set('captain', result);
        savedCaptain = result;

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
            //Then we save the Lieutenant
            return lieutenant.save();
          });
        return promise;

    }).then(function(result){
        //add a Pointer to the Lieutenant on the Team
        team.set('lieutenant', result);
        savedLieutenant = result;

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
            //Save the Team object
            return team.save();
        });
        return promise;

    }).then(function(result){

        teamObj = result;

        var Standing = Parse.Object.extend("Standings");
        var standing = new Standing();

        standing.set('team', result);
        standing.set('points', 0);
        standing.set('games_played', 0);
        standing.set('wins', 0);
        standing.set('tie', 0);
        standing.set('ot_losses', 0);
        standing.set('losses', 0);
        standing.set('goals_for', 0);
        standing.set('goals_against', 0);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
              // Return a promise that will be resolved when the save is finished.
              return standing.save();
            });
        return promise;

    }).then(function(){

        savedCaptain.set('team', teamObj);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
           // Return a promise that will be resolved when the save is finished.
            return savedCaptain.save();
        });
        return promise;

    }).then(function(){

        savedLieutenant.set('team', teamObj);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
          return savedLieutenant.save();
        });
        return promise;

    }).then(function(){
        var emailPromise = mailgun.sendEmail({
          to: captain_name + " <" + captain_email + ">; Joel Baudin <joel.baudin88@gmail.com>; " + lieutenant_name + " <" + lieutenant_email + ">",
          from: "Cobra Cup 2016 <joel@cobracup.se>",
          subject: "Ditt lag " + team_name + " är nu anmält till Cobra Cup 2016!",
          html: "<html><h3>Er anmälan till Cobra Cup 2016 är klar!</h3> <p>Det här är ett automatiskt genererat mail som skickas till båda lagmedlemmarna för att meddela att anmälan har gått igenom.</p><p>Era uppgifter är:<br> Kapten: <b>" + captain_name + "</b><br>Assisterande: <b>" + lieutenant_name + "</b><br>Lagnamn: <b>" + team_name + "</b><br><br>Ert lösenord är <b>" + pass + "</b></p><p><h3>Viktig information</h3>Som ni kanske sett så har vi en anmälningsavgift för att vara med på Cobra Cup. Denna avgift är till för att täcka hyra av lokal, middag till alla deltagare samt priser.<br>Denna avgift ligger på <b>200 kr</b> per person och ska vara betald en vecka innan Cobra Cup dvs. 12 december 2015. <b>Obs.</b> Om denna avgift på 200 kr /person (400 kr /lag) <u>inte</u> är betald i tid tappar laget sin plats i turneringen.<br><br>Betalning sker enklast via Swish till <b>070 566 64 21</b>. Märk din betalning med lagnamn.<br>Om du/ni inte har Swish eller inte vill använda er av det ber jag er kontakta mig för att få kontonummer.<br><br>Om det är några frågor tveka inte att kontakta oss på joel@cobracup.se.</p><p>Tack för att du använder dig av denna sida men mer än det, tack för att du vill vara med på Cobra Cup!<br><br>Med vänlig hälsning<br>Joel & David<br>www.cobracup.se</p></html>"
        });

        return emailPromise;

    }).then(function(){
        response.success(teamObj);
    }, function(error) {
        response.error("Creating team failed with error.code " + error.code + " error.message " + error.message);
    });
});
/*** END Create PRO/ALLSTAR Team ***/

/*** START Create Rookie Team ***/
Parse.Cloud.define("createRookieTeam", function(request, response) {

    var Team = Parse.Object.extend("Team");
    var Player = Parse.Object.extend("Player");

    var team = new Team();

    var captain_name = request.params.captain_name;
    var captain_email = request.params.captain_email;
    var captain_telephone = request.params.captain_telephone;
    var captain_gamertag = request.params.captain_gamertag;

    var lieutenant_name = request.params.lieutenant_name;
    var lieutenant_email = request.params.lieutenant_email;
    var lieutenant_telephone = request.params.lieutenant_telephone;
    var lieutenant_gamertag = request.params.lieutenant_gamertag;

    var team_name = request.params.team_name;
    var team_motto = request.params.team_motto;
    var nhlTeam = request.params.nhlTeam;
    var level = "1";
    var comment = request.params.comment;
    var hidden = request.params.hidden;

    var NHLTeam = Parse.Object.extend("NHLTeam");
    var nhlTeamObj = new NHLTeam();
    nhlTeamObj.id = nhlTeam;

    team.set("nhlTeam", nhlTeamObj);

    var legend = ["-","-","-"];
    var marathon = ["-","-","-"];

    team.set("legend", legend);
    team.set("marathon", marathon);

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

    if (_.isEmpty(hidden)) {hidden = false};
    if(hidden === "true"){
      hidden = true;
    } else {
      hidden = false;
    }

    team.set('hidden', hidden);

    //Create Captain object
    var captain = new Player();
    captain.set('name', captain_name);
    captain.set('email', captain_email);
    captain.set('telephone', captain_telephone);

    if (_.isEmpty(captain_gamertag)) {captain_gamertag = "-"};
    captain.set('gamertag', captain_gamertag);

    var capId = Math.floor((Math.random() * 100000) + 1);
    captain.set('player_id', capId.toString());

    captain.set('fights', 0);
    captain.set('goals', 0);

    //Create Lieutenant object
    var lieutenant = new Player();
    lieutenant.set('name', lieutenant_name);
    lieutenant.set('email', lieutenant_email);
    lieutenant.set('telephone', lieutenant_telephone);

    if (_.isEmpty(lieutenant_gamertag)) {lieutenant_gamertag = "-"};
    lieutenant.set('gamertag', lieutenant_gamertag);

    var lieuId = Math.floor((Math.random() * 100000) + 1);
    lieutenant.set('player_id', lieuId.toString());

    lieutenant.set('fights', 0);
    lieutenant.set('goals', 0);

    var teamObj;
    var savedCaptain; 
    var savedLieutenant;
    
    //Save the Captain
    captain.save().then(function(result) {
        //add a Pointer to the Captain on the Team
        team.set('captain', result);
        savedCaptain = result;

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
            //Then we save the Lieutenant
            return lieutenant.save();
         });
       return promise;

    }).then(function(result){
        //add a Pointer to the Lieutenant on the Team
        team.set('lieutenant', result);
        savedLieutenant = result;

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
            //Save the Team object
            return team.save();
        });
        return promise;

    }).then(function(result){

        teamObj = result;

        var Standing = Parse.Object.extend("Standings");
        var standing = new Standing();

        standing.set('team', result);
        standing.set('points', 0);
        standing.set('games_played', 0);
        standing.set('wins', 0);
        standing.set('tie', 0);
        standing.set('ot_losses', 0);
        standing.set('losses', 0);
        standing.set('goals_for', 0);
        standing.set('goals_against', 0);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
              // Return a promise that will be resolved when the save is finished.
              return standing.save();
           });
        return promise;

    }).then(function(result){

        var PlayerStats = Parse.Object.extend("PlayerStats");

        var playerStatCaptain = new PlayerStats();

        playerStatCaptain.set('player_name', captain_name);
        playerStatCaptain.set('player_id', capId.toString());
        playerStatCaptain.set('player_team', teamObj);
        playerStatCaptain.set('player_goals', 0);
        playerStatCaptain.set('player_fights', 0);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
              // Return a promise that will be resolved when the save is finished.
              return playerStatCaptain.save();
           });
        return promise;

    }).then(function(result){

        var PlayerStats = Parse.Object.extend("PlayerStats");

        var playerStatLieutenant = new PlayerStats();

        playerStatLieutenant.set('player_name', lieutenant_name);
        playerStatLieutenant.set('player_id', lieuId.toString());
        playerStatLieutenant.set('player_team', teamObj);
        playerStatLieutenant.set('player_goals', 0);
        playerStatLieutenant.set('player_fights', 0);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
            // Return a promise that will be resolved when the save is finished.
            return playerStatLieutenant.save();
        });
        return promise;

    }).then(function(result){

        savedCaptain.set('team', teamObj);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
              // Return a promise that will be resolved when the save is finished.
              return savedCaptain.save();
           });
        return promise;

    }).then(function(result){

        savedLieutenant.set('team', teamObj);

        var promise = Parse.Promise.as();
        promise = promise.then(function() {
              // Return a promise that will be resolved when the save is finished.
              return savedLieutenant.save();
           });
        return promise;

    }).then(function(){
        var emailPromise = mailgun.sendEmail({
          to: captain_name + " <" + captain_email + ">; Joel Baudin <joel.baudin88@gmail.com>; " + lieutenant_name + " <" + lieutenant_email + ">",
          from: "Hot Rod Cup 2016 <joel@cobracup.se>",
          subject: "Ditt lag " + team_name + " är nu anmält till Hot Rod Cup 2016!",
          html: "<html><h3>Er anmälan till Hot Rod Cup 2016 är klar!</h3> <p>Det här är ett automatiskt genererat mail som skickas till båda lagmedlemmarna för att meddela att anmälan har gått igenom.</p><p>Era uppgifter är:<br> Kapten: <b>" + captain_name + "</b><br>Assisterande: <b>" + lieutenant_name + "</b><br>Lagnamn: <b>" + team_name + "</b><br><br>Ert lösenord är <b>" + pass + "</b></p><p><h3>Viktig information</h3>Som ni kanske sett så har vi en anmälningsavgift för att vara med på Hot Rod Cup. Denna avgift är till för att täcka hyra av lokal, middag till alla deltagare samt priser.<br>Denna avgift ligger på <b>200 kr</b> per person och ska vara betald en vecka innan Hot Rod Cup dvs. 12 december 2015. <b>Obs.</b> Om denna avgift på 200 kr /person (400 kr /lag) <u>inte</u> är betald i tid tappar laget sin plats i turneringen.<br><br>Betalning sker enklast via Swish till <b>070 566 64 21</b>. Märk din betalning med lagnamn.<br>Om du/ni inte har Swish eller inte vill använda er av det ber jag er kontakta mig för att få kontonummer.<br><br>Om det är några frågor tveka inte att kontakta oss på joel@cobracup.se.</p><p>Tack för att du använder dig av denna sida men mer än det, tack för att du vill vara med på Hot Rod Cup!<br><br>Med vänlig hälsning<br>Joel & David<br>www.cobracup.se</p></html>"
        });

        return emailPromise;

    }).then(function(){
        response.success("Added new Rookie team");
    }, function(error) {
        response.error("Creating Rookie team failed with error.code " + error.code + " error.message " + error.message);
    });
});
/*** END Create Rookie Team ***/

Parse.Cloud.afterSave("Team", function(request) {

  var NHLTeam = Parse.Object.extend('NHLTeam');
  var nhlTeamQuery = new Parse.Query(NHLTeam);
  nhlTeamQuery.equalTo('objectId', request.object.get("nhlTeam").id);

  nhlTeamQuery.find().then(function(team) {
    var level = request.object.get("level");

    if ((typeof(level) !== 'undefined') && (_.isEqual(level, "1"))) {
      team[0].set('taken_rookie', true);
    } else {
      team[0].set('taken', true);
    }

    team[0].save();
    
  }, function(error){
    response.error("Updating taken status for NHL Team failed with error.code " + error.code + " error.message " + error.message);
  });
});

Parse.Cloud.beforeSave("Team", function(request, response) {
  var NHLTeam = Parse.Object.extend('NHLTeam');
  var nhlTeamQuery = new Parse.Query(NHLTeam);
  nhlTeamQuery.equalTo('objectId', request.object.get("nhlTeam").id);

  nhlTeamQuery.find().then(function(team) {
    var level = request.object.get("level");

    var objectId = request.object.id;
    if ((typeof(objectId) !== 'undefined') && (!_.isEmpty(objectId))) {
      console.log("team with id " + objectId + " already exists, no need to deny save");
      response.success();
    } else if ((typeof(level) !== 'undefined') && (_.isEqual(level, "1"))) {
      if(team[0].get('taken_rookie')){
        response.error("you cannot choose an NHL team that's already taken");
      } else {
        response.success();
      }
    } else if ((typeof(level) !== 'undefined') && (level > 1)){
      if(team[0].get('taken')){
        response.error("you cannot choose an NHL team that's already taken");
      } else {
        response.success();
      }
    } else {
      response.error("something's wrong and we shouldn't continue");
    }
    
  }, function(error){
    response.error("Getting taken status NHL Team failed with error.code " + error.code + " error.message " + error.message);
  });
});


Parse.Cloud.afterDelete("Team", function(request) {
  var NHLTeam = Parse.Object.extend('NHLTeam');
  var nhlTeamQuery = new Parse.Query(NHLTeam);
  nhlTeamQuery.equalTo('objectId', request.object.get("nhlTeam").id);

  nhlTeamQuery.find().then(function(team) {
    var level = request.object.get("level");

    if ((typeof(level) !== 'undefined') && (_.isEqual(level, "1"))) {
      console.log("Setting taken_rookie status for " + team[0].get("name") + " to false");
      team[0].set('taken_rookie', false);
    } else {
      console.log("Setting taken status for " + team[0].get("name") + " to false");
      team[0].set('taken', false);
    }

    team[0].save();
    
  }, function(error){
    response.error("Updating taken status for NHL Team failed with error.code " + error.code + " error.message " + error.message);
  });
});


Parse.Cloud.define("deleteTeam", function(request, response) {
  var Team = Parse.Object.extend('Team');
  var teamQuery = new Parse.Query(Team);
  teamQuery.include(['nhlTeam','captain','lieutenant']);
  teamQuery.equalTo('team_id', request.params.team_id);

  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.matchesQuery('team', teamQuery);

  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.matchesQuery('team', teamQuery);

  console.log("Looking for Standings object...");
  standingsQuery.find().then(function(standing){
    if(typeof(standing[0]) !== 'undefined'){

      console.log("Found object in Standings with objectId = " + standing[0].id);

      return standing[0].destroy();

    } else {
      console.log("Couldn't find a Standings object to delete");
      return Parse.Promise.error("Couldn't find a Standings object to delete");
    }

  }).then(function(){
      
      console.log("Looking for Player objects...");

      return playerQuery.find();

  }).then(function(players){

    if(typeof(players) !== 'undefined'){
      var size = _.size(players);
      console.log("Found " + size + " Player(s) to delete" + "\n" + "\n");

      var promise = Parse.Promise.as();

      _.each(players, function(player) {
        console.log("Deleting Player with id " + player.id);
        promise = promise.then(function() {
          return player.destroy();
        });
      });

      return promise;

    } else {
      console.log("Couldn't find Player objects to delete");
      return Parse.Promise.error("Couldn't find Player objects to delete");
    }
    
  }).then(function(){

    console.log("Looking for Team object...");

    return teamQuery.find();

  }).then(function(team){

    if((typeof(team[0]) !== 'undefined') && (typeof(team[0].id) !== 'undefined')){
      console.log("Found Team with objectId = " + team[0].id);

      return team[0].destroy();

    } else {
      console.log("No Team with id " + request.params.team_id + " was found");
      return Parse.Promise.error("No Team with id " + request.params.team_id + " was found");
    }
  
  }).then(function(){
    console.log("Deleted the Team with id = " + request.params.team_id + "\n" + "\n");
    response.success("Deleted the Team with id = " + request.params.team_id);
  }, function(error) {

    if((typeof(error.code) !== 'undefined') || (typeof(error.message) !== 'undefined')){
        console.log("Deleting Team failed with error.code " + error.code + " error.message " + error.message);
        response.error("Deleting Team failed with error.code " + error.code + " error.message " + error.message);
    } else {
        console.log("Deleting Team failed with error.message: " + error);
        response.error("Deleting Team failed with error.message: " + error);
    }

  });
});

/* ----------- */

/***** Utility Functions *****/

Parse.Cloud.define("calculatePoints", function(request, response) {
  var Player = Parse.Object.extend('Player');
  var playersQuery = new Parse.Query(Player);
  playersQuery.find().then(function(results) {
    var promise = Parse.Promise.as();
    _.each(results, function(result) {
      var points = result.get('goals') + result.get('assists');
      result.set('points', points);
      promise = promise.then(function() {
            // Return a promise that will be resolved when the save is finished.
            return result.save();
          });
    });

    return promise;

  }).then(function() {
   response.success("Player points successfully calculated");
      // Every object is updated.
    });
});

Parse.Cloud.define("cleanPlayerStats", function(request, response) {
  var Player = Parse.Object.extend('Player');
  var playersQuery = new Parse.Query(Player);
  playersQuery.find().then(function(results) {
    var promise = Parse.Promise.as();
    _.each(results, function(result) {
      result.set('points', 0);
      result.set('goals', 0);
      result.set('assists', 0);
      result.set('fights', 0);
      promise = promise.then(function() {
            // Return a promise that will be resolved when the save is finished.
            return result.save();
          });
    });

    return promise;

  }).then(function() {
   response.success("Player points successfully calculated");
      // Every object is updated.
    });
});

Parse.Cloud.define("cleanStandings", function(request, response) {
	var Standings = Parse.Object.extend('Standings');
	var standingsQuery = new Parse.Query(Standings);
	standingsQuery.find().then(function(results) {
    var promise = Parse.Promise.as();
    _.each(results, function(result) {
		  	// For each item, extend the promise with a function to save it.
        result.set('difference', 0);
        result.set('games_played', 0);
        result.set('goals_against', 0);
        result.set('goals_for', 0);
        result.set('wins', 0);
        result.set('losses', 0);
        result.set('ot_losses', 0);
        result.set('tie', 0);
        result.set('points', 0);
        promise = promise.then(function() {
		      	// Return a promise that will be resolved when the save is finished.
		      	return result.save();
          });
      });

    return promise;

  }).then(function() {
   response.success("Standings table is cleaned");
	  	// Every object is updated.
   });
});

Parse.Cloud.define("migratePlayers", function(request, response) {
  	var Team = Parse.Object.extend('Team');
  	var teamQuery = new Parse.Query(Team);

  	var resultArray = [];

  	teamQuery.find().then(function(results) {
  		var promise = Parse.Promise.as();
      _.each(results, function(result) {
          promise = promise.then(function() {

              var colCaptain = {"name":result.get("captain_name"), 
              "email":result.get("captain_email"), 
              "telephone":result.get("captain_telephone"), 
              "gamertag":result.get("captain_gamertag"),
              "playerid":result.get("captain_id")
              };

              var colLieutenant = {"name":result.get("lieutenant_name"), 
              "email":result.get("lieutenant_email"), 
              "telephone":result.get("lieutenant_telephone"), 
              "gamertag":result.get("lieutenant_gamertag"),
              "playerid":result.get("lieutenant_id")
              };	

              console.log("Captain =  " + JSON.stringify(colCaptain));
              console.log("Lieutenant =  " + JSON.stringify(colLieutenant));

              var Player = Parse.Object.extend("Player");

              var captain = new Player();
              captain.set('name', result.get("captain_name"));
              captain.set('email', result.get("captain_email"));
              captain.set('gamertag', result.get("captain_gamertag"));
              captain.set('telephone', result.get("captain_telephone"));
              captain.set('player_id', result.get("captain_id"));
              captain.set('team', result.id);
              captain.set('fights', 0);
              captain.set('goals', 0);

              var lieutenant = new Player();
              lieutenant.set('name', result.get("lieutenant_name"));
              lieutenant.set('email', result.get("lieutenant_email"));
              lieutenant.set('gamertag', result.get("lieutenant_gamertag"));
              lieutenant.set('telephone', result.get("lieutenant_telephone"));
              lieutenant.set('player_id', result.get("lieutenant_id"));
              lieutenant.set('team', result.id);
              lieutenant.set('fights', 0);
              lieutenant.set('goals', 0);		  				

              resultArray.push(captain);
              resultArray.push(lieutenant);

              return Parse.Promise.as();

          }, function(error) {
            response.error("Player retrieval failed with error.code " + error.code + " error.message " + error.message);
          });
      });

      return promise;

    }).then(function() {
      return Parse.Object.saveAll(resultArray);
    }).then(function() {
      response.success("Players are migrated");
    }, function(error){
      response.error("Script failed with error.code " + error.code + " error.message " + error.message);
    });
});