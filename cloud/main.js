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

/**** PLAYER ****/
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
      if (_.isEqual(request.params.birthyear, "-radera")) {
        result[0].set('birthyear',"");
      } else {
        result[0].set('birthyear',request.params.birthyear);
      }
    }
    if ((typeof(request.params.birthplace) !== 'undefined') && (!_.isEmpty(request.params.birthplace))) {
      if (_.isEqual(request.params.birthplace, "-radera")) {
        result[0].set('birthplace',"");
      }
      result[0].set('birthplace',request.params.birthplace);
    }
    if ((typeof(request.params.nation) !== 'undefined') && (!_.isEmpty(request.params.nation))) {
      if (_.isEqual(request.params.nation, "-radera")) {
        result[0].set('nation',"");
      } else {
        result[0].set('nation',request.params.nation);
      }
    }
    if ((typeof(request.params.position) !== 'undefined') && (!_.isEmpty(request.params.position))) {
      if (_.isEqual(request.params.position, "-radera")) {
        result[0].set('position',"");
      } else  {
        result[0].set('position',request.params.position);  
      }
    }
    if ((typeof(request.params.shoots) !== 'undefined') && (!_.isEmpty(request.params.shoots))) {
      if (_.isEqual(request.params.shoots, "-radera")) {
        result[0].set('shoots',"");
      } else {
        result[0].set('shoots',request.params.shoots);
      }
    }
    if ((typeof(request.params.profile) !== 'undefined') && (!_.isEmpty(request.params.profile))) {
      if (_.isEqual(request.params.profile, "-radera")) {
        result[0].set('profile',"");
      } else {
        result[0].set('profile',request.params.profile);
      }
    }
    if ((typeof(request.params.twitter) !== 'undefined') && (!_.isEmpty(request.params.twitter))) {
      if (_.isEqual(request.params.twitter, "-radera")) {
        result[0].set('twitter',"");
      } else {
        result[0].set('twitter',request.params.twitter);
      }
    }
    if ((typeof(request.params.facebook) !== 'undefined') && (!_.isEmpty(request.params.facebook))) {
      if (_.isEqual(request.params.facebook, "-radera")) {
        result[0].set('facebook',"");
      } else {
        result[0].set('facebook',request.params.facebook);
      }
    }
    if ((typeof(request.params.gamertag) !== 'undefined') && (!_.isEmpty(request.params.gamertag))) {
      if (_.isEqual(request.params.gamertag, "-radera")) {
        result[0].set('gamertag',"");
      } else {
        result[0].set('gamertag',request.params.gamertag);
      }
    }
    if ((typeof(request.params.psn_id) !== 'undefined') && (!_.isEmpty(request.params.psn_id))) {
      if (_.isEqual(request.params.psn_id, "-radera")) {
        result[0].set('psn_id',"");
      } else {
        result[0].set('psn_id',request.params.psn_id);
      }
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

  var name = "";
  var email = "";

  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.equalTo('player_id', request.params.player_id);
  playerQuery.find().then(function(results) {
    _.each(results, function(result) {

      name = result.get("name");
      email = result.get("email");

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
    response.success("Sent password to " + i + " player with name " + name + " and email " + email);
  }, function(error){
    response.error("Sending password to user failed with error.code " + error.code + " error.message " + error.message);
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

Parse.Cloud.beforeSave("Player", function(request, response) {
  var goals = request.object.get("goals");
  var assists = request.object.get("assists");
  var points = request.object.get("points");

  if ((typeof(goals) === 'undefined') || (typeof(assists) === 'undefined') || (typeof(points) === 'undefined')){
    response.error("The stats objects goals, assists and points need to be defined on the Player object");
  } else {
    var temp_points = goals + assists;
    /*
    console.log("temp_points: " + temp_points);
    console.log("points: " + points);
    */
    if (_.isEqual(parseInt(points), parseInt(temp_points))) {
      response.success();
    } else {
      response.error("The Points didn't match the sum of Goals and Assists. Points: '" + points + "' and Goals + Assists: '" + temp_points + "'");
    }
  }
});
/**** PLAYER ****/

/**** TEAM ****/
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

/**** /TEAM ****/

/** GAMES **/
Parse.Cloud.define("getGroupGames", function(request, response) {
    var Game = Parse.Object.extend('Game');
    var gameQuery = new Parse.Query(Game);
    gameQuery.include(['home.nhlTeam','away.nhlTeam']);
    gameQuery.include(['home.captain','home.lieutenant']);
    gameQuery.include(['away.captain','away.lieutenant']);
    gameQuery.equalTo('type', 1);
    gameQuery.find().then(function(results) {
        response.success(results);                            
    }, function(error) {
      response.error("Fetching group games failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.define("getPlayoffGames", function(request, response) {
    var POGame = Parse.Object.extend('POGame');
    var gameQuery = new Parse.Query(POGame);
    gameQuery.include(['home.nhlTeam','away.nhlTeam']);
    gameQuery.include(['home.captain','home.lieutenant']);
    gameQuery.include(['away.captain','away.lieutenant']);
    gameQuery.equalTo('type', 2);
    gameQuery.find().then(function(results) {
        response.success(results);                            
    }, function(error) {
      response.error("Fetching group games failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.define("getGameWithId", function(request, response) {
    var Game = Parse.Object.extend('Game');
    var gameQuery = new Parse.Query(Game);
    gameQuery.include(['home.nhlTeam','away.nhlTeam']);
    gameQuery.include(['home.captain','home.lieutenant']);
    gameQuery.include(['away.captain','away.lieutenant']);
    gameQuery.equalTo('game_id', request.params.game_id);
    gameQuery.find().then(function(result) {
        response.success(result);                            
    }, function(error) {
      response.error("Fetching Game with id '" + request.params.game_id + "' failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.beforeSave("Game", function(request, response) {
  var round = request.object.get("round");
  var group = request.object.get("group");
  var type = request.object.get("type");
  var played = request.object.get("played");

  if ((typeof(round) !== 'undefined') && ((round < 1) || (round > 12))){
    response.error("Round '" + round + "' is not valid. There's only 12 rounds in the group phase of Cobra Cup");
  } else if ((typeof(group) !== 'undefined') && ((group < 1) || (group > 4))){
    response.error("Group '" + group + "' is not valid. We have 4 groups in Cobra Cup so it can't be less or more than that");
  } else if ((typeof(type) !== 'undefined') && ((type < 1) || (type > 2))){
    response.error("Type '" + type + "' is not valid. There's only two types of games in Cobra Cup Group (1) or Playoff (2)");
  } else if (played){
    var home_goals_total = request.object.get("home_goals_total");
    var away_goals_total = request.object.get("away_goals_total");
    var away_stats = request.object.get("away_stats");
    var home_stats = request.object.get("home_stats");

    var home_player_goals = home_stats.captain_goals + home_stats.lieutenant_goals;
    var away_player_goals = away_stats.captain_goals + away_stats.lieutenant_goals;
    if (!_.isEqual(home_player_goals,home_goals_total)) {
      response.error("The amount of goals the Home team has made and the players has made need to match. Now its Team:'" + home_goals_total + "' and Players:'" + home_player_goals);
    } else if (!_.isEqual(away_player_goals,away_goals_total)) {
      response.error("The amount of goals the Away team has made and the players has made need to match. Now its Team:'" + away_goals_total + "' and Players:'" + away_player_goals);
    } else {
      response.success();
    }
  } else {
    response.success();
  }
});

Parse.Cloud.define("createGroupGame", function(request, response) {
    var Game = Parse.Object.extend("Game");
    var game = new Game();

    var round = "";
    var group = "";
    var hometeam = "";
    var awayteam = "";
    
    if((typeof(request.params.round) !== 'undefined') && (!_.isEmpty(request.params.round))){
      round = request.params.round;
    }
    if((typeof(request.params.group) !== 'undefined') && (!_.isEmpty(request.params.group))){
      group = request.params.group;
    }
    if((typeof(request.params.hometeam) !== 'undefined') && (!_.isEmpty(request.params.hometeam))){
      hometeam = request.params.hometeam;
    } 
    if((typeof(request.params.awayteam) !== 'undefined') && (!_.isEmpty(request.params.awayteam))){
      awayteam = request.params.awayteam;
    }  

    if (_.isEmpty(round) || _.isEmpty(group) || _.isEmpty(hometeam) || _.isEmpty(awayteam)) {
      console.log("Mandatory values was missing.");
      response.error("Mandatory values was missing.");
    }

    var Team = Parse.Object.extend("Team");

    var obj_hometeam = new Team();
    obj_hometeam.id = hometeam;

    var obj_awayteam = new Team();
    obj_awayteam.id = awayteam;

    game.set("home", obj_hometeam);
    game.set("away", obj_awayteam);

    game.set('played', false);

    var gameId = Math.floor((Math.random() * 100000) + 1);
    game.set('game_id', gameId.toString());

    if(!_.isNumber(round)) {
      round = parseInt(round);
    }
    game.set('round', round);

    if(!_.isNumber(group)) {
      group = parseInt(group);
    }
    game.set('group', group);

    game.set('type', 1);

    game.save().then(function(result) {
        response.success("Saved Game with id = '" + gameId + "'");
    }, function(error) {
        response.error("Creating Game failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.define("saveGroupGameResult", function(request, response) {
  /* global variables */
  var home_id = "";
  var away_id = "";

  home_goals_total = 0;
  away_goals_total = 0;

  var away_stats;
  var home_stats;

  var to_overtime;

  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  gameQuery.equalTo('game_id', request.params.game_id);
  gameQuery.include(['home.captain','home.lieutenant']);
  gameQuery.include(['away.captain','away.lieutenant']);
  gameQuery.find().then(function(result) {

    var home_captain_id = "";
    var home_lieutenant_id = "";

    var away_captain_id = "";
    var away_lieutenant_id = "";

    home_captain_id = result[0].get("home").get("captain").get("player_id");
    home_lieutenant_id = result[0].get("home").get("lieutenant").get("player_id");

    away_captain_id = result[0].get("away").get("captain").get("player_id");
    away_lieutenant_id = result[0].get("away").get("lieutenant").get("player_id");

    /*
    console.log("home_captain_id: " + home_captain_id);
    console.log("home_lieutenant_id: " + home_lieutenant_id);
    console.log("away_captain_id: " + away_captain_id);
    console.log("away_lieutenant_id: " + away_lieutenant_id);
    */

    /** global **/
    to_overtime = false;

    /** home team **/
    var home_goals_p1 = 0;
    var home_goals_p2 = 0;
    var home_goals_p3 = 0;
    var home_goals_ot = 0;

    var home_faceoffs = 0;

    var home_shots_total = 0;

    var home_shots_p1 = 0;
    var home_shots_p2 = 0;
    var home_shots_p3 = 0;
    var home_shots_ot = 0;

    var home_captain_goals = 0;
    var home_captain_assists = 0;
    var home_captain_fights = 0;

    var home_lieutenant_goals = 0;
    var home_lieutenant_assists = 0;
    var home_lieutenant_fights = 0;

    if ((typeof(request.params.home_goals_p1) !== 'undefined') && (!_.isEmpty(request.params.home_goals_p1))) {
      home_goals_p1 = parseInt(request.params.home_goals_p1);
    }
    if ((typeof(request.params.home_goals_p2) !== 'undefined') && (!_.isEmpty(request.params.home_goals_p2))) {
      home_goals_p2 = parseInt(request.params.home_goals_p2);
    }
    if ((typeof(request.params.home_goals_p3) !== 'undefined') && (!_.isEmpty(request.params.home_goals_p3))) {
      home_goals_p3 = parseInt(request.params.home_goals_p3);
    }
    if ((typeof(request.params.home_goals_ot) !== 'undefined') && (!_.isEmpty(request.params.home_goals_ot))) {
      home_goals_ot = parseInt(request.params.home_goals_ot);
    }

    if ((typeof(request.params.home_faceoffs) !== 'undefined') && (!_.isEmpty(request.params.home_faceoffs))) {
      home_faceoffs = parseInt(request.params.home_faceoffs);
    }

    if ((typeof(request.params.home_shots_p1) !== 'undefined') && (!_.isEmpty(request.params.home_shots_p1))) {
      home_shots_p1 = parseInt(request.params.home_shots_p1);
    }
    if ((typeof(request.params.home_shots_p2) !== 'undefined') && (!_.isEmpty(request.params.home_shots_p2))) {
      home_shots_p2 = parseInt(request.params.home_shots_p2);
    }
    if ((typeof(request.params.home_shots_p3) !== 'undefined') && (!_.isEmpty(request.params.home_shots_p3))) {
      home_shots_p3 = parseInt(request.params.home_shots_p3);
    }
    if ((typeof(request.params.home_shots_ot) !== 'undefined') && (!_.isEmpty(request.params.home_shots_ot))) {
      home_shots_ot = parseInt(request.params.home_shots_ot);
    }

    if ((typeof(request.params.home_captain_goals) !== 'undefined') && (!_.isEmpty(request.params.home_captain_goals))) {
      home_captain_goals = parseInt(request.params.home_captain_goals);
    }
    if ((typeof(request.params.home_captain_assists) !== 'undefined') && (!_.isEmpty(request.params.home_captain_assists))) {
      home_captain_assists = parseInt(request.params.home_captain_assists);
    }
    if ((typeof(request.params.home_captain_fights) !== 'undefined') && (!_.isEmpty(request.params.home_captain_fights))) {
      home_captain_fights = parseInt(request.params.home_captain_fights);
    }

    if ((typeof(request.params.home_lieutenant_goals) !== 'undefined') && (!_.isEmpty(request.params.home_lieutenant_goals))) {
      home_lieutenant_goals = parseInt(request.params.home_lieutenant_goals);
    }
    if ((typeof(request.params.home_lieutenant_assists) !== 'undefined') && (!_.isEmpty(request.params.home_lieutenant_assists))) {
      home_lieutenant_assists = parseInt(request.params.home_lieutenant_assists);
    }
    if ((typeof(request.params.home_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.params.home_lieutenant_fights))) {
      home_lieutenant_fights = parseInt(request.params.home_lieutenant_fights);
    }

    /** away team **/
    var away_goals_p1 = 0;
    var away_goals_p2 = 0;
    var away_goals_p3 = 0;
    var away_goals_ot = 0;

    var away_shots_total = 0;

    var away_shots_p1 = 0;
    var away_shots_p2 = 0;
    var away_shots_p3 = 0;
    var away_shots_ot = 0;

    var away_faceoffs = 0;

    var away_captain_goals = 0;
    var away_captain_assists = 0;
    var away_captain_fights = 0;

    var away_lieutenant_goals = 0;
    var away_lieutenant_assists = 0;
    var away_lieutenant_fights = 0;

    if ((typeof(request.params.away_goals_p1) !== 'undefined') && (!_.isEmpty(request.params.away_goals_p1))) {
      away_goals_p1 = parseInt(request.params.away_goals_p1);
    }
    if ((typeof(request.params.away_goals_p2) !== 'undefined') && (!_.isEmpty(request.params.away_goals_p2))) {
      away_goals_p2 = parseInt(request.params.away_goals_p2);
    }
    if ((typeof(request.params.away_goals_p3) !== 'undefined') && (!_.isEmpty(request.params.away_goals_p3))) {
      away_goals_p3 = parseInt(request.params.away_goals_p3);
    }
    if ((typeof(request.params.away_goals_ot) !== 'undefined') && (!_.isEmpty(request.params.away_goals_ot))) {
      away_goals_ot = parseInt(request.params.away_goals_ot);
    }
    
    if ((typeof(request.params.away_faceoffs) !== 'undefined') && (!_.isEmpty(request.params.away_faceoffs))) {
      away_faceoffs = parseInt(request.params.away_faceoffs);
    }

    if ((typeof(request.params.away_shots_p1) !== 'undefined') && (!_.isEmpty(request.params.away_shots_p1))) {
      away_shots_p1 = parseInt(request.params.away_shots_p1);
    }
    if ((typeof(request.params.away_shots_p2) !== 'undefined') && (!_.isEmpty(request.params.away_shots_p2))) {
      away_shots_p2 = parseInt(request.params.away_shots_p2);
    }
    if ((typeof(request.params.away_shots_p3) !== 'undefined') && (!_.isEmpty(request.params.away_shots_p3))) {
      away_shots_p3 = parseInt(request.params.away_shots_p3);
    }
    if ((typeof(request.params.away_shots_ot) !== 'undefined') && (!_.isEmpty(request.params.away_shots_ot))) {
      away_shots_ot = parseInt(request.params.away_shots_ot);
    }

    if ((typeof(request.params.away_captain_goals) !== 'undefined') && (!_.isEmpty(request.params.away_captain_goals))) {
      away_captain_goals = parseInt(request.params.away_captain_goals);
    }
    if ((typeof(request.params.away_captain_assists) !== 'undefined') && (!_.isEmpty(request.params.away_captain_assists))) {
      away_captain_assists = parseInt(request.params.away_captain_assists);
    }
    if ((typeof(request.params.away_captain_fights) !== 'undefined') && (!_.isEmpty(request.params.away_captain_fights))) {
      away_captain_fights = parseInt(request.params.away_captain_fights);
    }

    if ((typeof(request.params.away_lieutenant_goals) !== 'undefined') && (!_.isEmpty(request.params.away_lieutenant_goals))) {
      away_lieutenant_goals = parseInt(request.params.away_lieutenant_goals);
    }
    if ((typeof(request.params.away_lieutenant_assists) !== 'undefined') && (!_.isEmpty(request.params.away_lieutenant_assists))) {
      away_lieutenant_assists = parseInt(request.params.away_lieutenant_assists);
    }
    if ((typeof(request.params.away_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.params.away_lieutenant_fights))) {
      away_lieutenant_fights = parseInt(request.params.away_lieutenant_fights);
    }

    home_goals_total = (home_goals_p1+home_goals_p2+home_goals_p3+home_goals_ot);
    home_shots_total = (home_shots_p1+home_shots_p2+home_shots_p3+home_shots_ot);

    result[0].set('home_goals_total',home_goals_total);
    result[0].set('home_shots_total',home_shots_total);
    result[0].set('home_faceoffs_total',home_faceoffs);

    away_goals_total = (away_goals_p1+away_goals_p2+away_goals_p3+away_goals_ot);
    away_shots_total = (away_shots_p1+away_shots_p2+away_shots_p3+away_shots_ot);

    result[0].set('away_goals_total',away_goals_total);
    result[0].set('away_shots_total',away_shots_total);
    result[0].set('away_faceoffs_total',away_faceoffs);

    var jsonDataHome = {};

    jsonDataHome["goals_p1"] = home_goals_p1;
    jsonDataHome["goals_p2"] = home_goals_p2;
    jsonDataHome["goals_p3"] = home_goals_p3;
    jsonDataHome["goals_ot"] = home_goals_ot;

    jsonDataHome["shots_p1"] = home_shots_p1;
    jsonDataHome["shots_p2"] = home_shots_p2;
    jsonDataHome["shots_p3"] = home_shots_p3;
    jsonDataHome["shots_ot"] = home_shots_ot;

    jsonDataHome["captain_id"] = home_captain_id;
    jsonDataHome["captain_goals"] = home_captain_goals;
    jsonDataHome["captain_assists"] = home_captain_assists;
    jsonDataHome["captain_fights"] = home_captain_fights;

    jsonDataHome["lieutenant_id"] = home_lieutenant_id;
    jsonDataHome["lieutenant_goals"] = home_lieutenant_goals;
    jsonDataHome["lieutenant_assists"] = home_lieutenant_assists;
    jsonDataHome["lieutenant_fights"] = home_lieutenant_fights;

    result[0].set('home_stats',jsonDataHome);

    var jsonDataAway = {};

    jsonDataAway["goals_p1"] = away_goals_p1;
    jsonDataAway["goals_p2"] = away_goals_p2;
    jsonDataAway["goals_p3"] = away_goals_p3;
    jsonDataAway["goals_ot"] = away_goals_ot;

    jsonDataAway["shots_p1"] = away_shots_p1;
    jsonDataAway["shots_p2"] = away_shots_p2;
    jsonDataAway["shots_p3"] = away_shots_p3;
    jsonDataAway["shots_ot"] = away_shots_ot;

    jsonDataAway["captain_id"] = away_captain_id;
    jsonDataAway["captain_goals"] = away_captain_goals;
    jsonDataAway["captain_assists"] = away_captain_assists;
    jsonDataAway["captain_fights"] = away_captain_fights;

    jsonDataAway["lieutenant_id"] = away_lieutenant_id;
    jsonDataAway["lieutenant_goals"] = away_lieutenant_goals;
    jsonDataAway["lieutenant_assists"] = away_lieutenant_assists;
    jsonDataAway["lieutenant_fights"] = away_lieutenant_fights;

    result[0].set('away_stats',jsonDataAway);

    home_stats = jsonDataHome;
    away_stats = jsonDataAway;

    var Team = Parse.Object.extend("Team");

    var obj_hometeam = new Team();
    obj_hometeam.id = result[0].get("home").id;

    var Team = Parse.Object.extend("Team");

    var obj_awayteam = new Team();
    obj_awayteam.id = result[0].get("away").id;

    home_id = obj_hometeam.id;
    away_id = obj_awayteam.id;

    if (home_goals_total > away_goals_total) {
      result[0].set('winner',obj_hometeam);
    } else {
      result[0].set('winner',obj_awayteam);
    }

    if ((home_goals_ot > 0) || (away_goals_ot > 0)) {
      to_overtime = true;
    }
    result[0].set('overtime',to_overtime);

    result[0].set('played',true);

    return result[0].save();

  }).then(function(result) {
    console.log(result);

    home_goals_total = home_goals_total.toString();
    away_goals_total = away_goals_total.toString();

    to_overtime = to_overtime.toString();

    return Parse.Cloud.run('updateStandingForTeam', {"team_objectId":home_id,"goals_for":home_goals_total,"goals_against":away_goals_total,"overtime":to_overtime});
  }).then(function(result) {
    console.log(result);
    return Parse.Cloud.run('updateStandingForTeam', {"team_objectId":away_id,"goals_for":away_goals_total,"goals_against":home_goals_total,"overtime":to_overtime});
  }).then(function(result){
    console.log(result);
    console.log("Updating Home Captain ...");
    //Home Captain
    var h_c_id = home_stats.captain_id;
    var h_c_goals = home_stats.captain_goals;
    var h_c_assists = home_stats.captain_assists;
    var h_c_fights = home_stats.captain_fights;

    h_c_goals = h_c_goals.toString();
    h_c_assists = h_c_assists.toString();
    h_c_fights = h_c_fights.toString();

    return Parse.Cloud.run('updatePlayerStats', {player_id: h_c_id, goals: h_c_goals, assists: h_c_assists, fights: h_c_fights});
  }).then(function(result){
    console.log(result);
    console.log("Updating Home Lieutenant ...");
    //Home Lieutenant
    var h_l_id = home_stats.lieutenant_id;
    var h_l_goals = home_stats.lieutenant_goals;
    var h_l_assists = home_stats.lieutenant_assists;
    var h_l_fights = home_stats.lieutenant_fights;

    h_l_goals = h_l_goals.toString();
    h_l_assists = h_l_assists.toString();
    h_l_fights = h_l_fights.toString();

    return Parse.Cloud.run('updatePlayerStats', {player_id: h_l_id, goals: h_l_goals, assists: h_l_assists, fights: h_l_fights});
  }).then(function(result){
    console.log(result);
    console.log("Updating Away Captain ...");
    //Away Captain
    var a_c_id = away_stats.captain_id;
    var a_c_goals = away_stats.captain_goals;
    var a_c_assists = away_stats.captain_assists;
    var a_c_fights = away_stats.captain_fights;

    a_c_goals = a_c_goals.toString();
    a_c_assists = a_c_assists.toString();
    a_c_fights = a_c_fights.toString();

    return Parse.Cloud.run('updatePlayerStats', {player_id: a_c_id, goals: a_c_goals, assists: a_c_assists, fights: a_c_fights});
  }).then(function(result){
    console.log(result);
    console.log("Updating Away Lieutenant ...");
    //Away Lieutenant
    var a_l_id = away_stats.lieutenant_id;
    var a_l_goals = away_stats.lieutenant_goals;
    var a_l_assists = away_stats.lieutenant_assists;
    var a_l_fights = away_stats.lieutenant_fights;

    a_l_goals = a_l_goals.toString();
    a_l_assists = a_l_assists.toString();
    a_l_fights = a_l_fights.toString();

    return Parse.Cloud.run('updatePlayerStats', {player_id: a_l_id, goals: a_l_goals, assists: a_l_assists, fights: a_l_fights});
  }).then(function(result){
    response.success("Saved result for Group Game with id '" + request.params.game_id + "'");
  }, function(error) {
    response.error("Saving result for Group Game with id '" + request.params.game_id + "' failed with error.code " + error.code + " error.message " + error.message);
  });
});

/** Playoff Games **/
/**
Parse.Cloud.define("generatePlayoffGames", function(request, response) {
    Parse.Cloud.run('getPlayoffTeams', {}).then(function(results) {
      var promise = Parse.Promise.as();

      _.each(results, function(result) {


        result.set('points', 0);
        result.set('goals', 0);
        result.set('assists', 0);
        result.set('fights', 0);

        promise = promise.then(function() {
          return result.save();
        });

      });

      return promise;

      response.success("Saved Playoff Game with id = '" + gameId + "'");
    }, function(error) {
        response.error("Creating Playoff Game failed with error.code " + error.code + " error.message " + error.message);
    });
});
**/

Parse.Cloud.beforeSave("POGame", function(request, response) {
  var round = request.object.get("round");
  var played = request.object.get("played");

  if ((typeof(round) !== 'undefined') && ((round < 1) || (round > 3))){
    response.error("Round '" + round + "' is not valid. There's only 3 rounds (Quarter, Semi, and Final) in the Playoff phase of Cobra Cup");
  } else if (played){
    var home_goals_total = request.object.get("home_goals_total");
    var away_goals_total = request.object.get("away_goals_total");
    var away_stats = request.object.get("away_stats");
    var home_stats = request.object.get("home_stats");

    var home_player_goals = home_stats.captain_goals + home_stats.lieutenant_goals;
    var away_player_goals = away_stats.captain_goals + away_stats.lieutenant_goals;
    if (!_.isEqual(home_player_goals,home_goals_total)) {
      response.error("The amount of goals the Home team has made and the players has made need to match. Now its Team:'" + home_goals_total + "' and Players:'" + home_player_goals);
    } else if (!_.isEqual(away_player_goals,away_goals_total)) {
      response.error("The amount of goals the Away team has made and the players has made need to match. Now its Team:'" + away_goals_total + "' and Players:'" + away_player_goals);
    } else {
      response.success();
    }
  } else {
    response.success();
  }
});

Parse.Cloud.define("createPlayoffGame", function(request, response) {
    var POGame = Parse.Object.extend("POGame");
    var game = new POGame();

    var round = "";
    var indentifier = ""
    var hometeam = "";
    var awayteam = "";
    
    if((typeof(request.params.round) !== 'undefined') && (!_.isEmpty(request.params.round))){
      round = request.params.round;
    }
    if((typeof(request.params.indentifier) !== 'undefined') && (!_.isEmpty(request.params.indentifier))){
      indentifier = request.params.indentifier;
    }
    if((typeof(request.params.hometeam) !== 'undefined') && (!_.isEmpty(request.params.hometeam))){
      hometeam = request.params.hometeam;
    } 
    if((typeof(request.params.awayteam) !== 'undefined') && (!_.isEmpty(request.params.awayteam))){
      awayteam = request.params.awayteam;
    }  

    if (_.isEmpty(round) || _.isEmpty(hometeam) || _.isEmpty(awayteam)) {
      console.log("Mandatory values was missing.");
      response.error("Mandatory values was missing.");
    }

    var Team = Parse.Object.extend("Team");

    var obj_hometeam = new Team();
    obj_hometeam.id = hometeam;

    var obj_awayteam = new Team();
    obj_awayteam.id = awayteam;

    game.set("home", obj_hometeam);
    game.set("away", obj_awayteam);

    game.set('played', false);

    var gameId = Math.floor((Math.random() * 100000) + 1);
    game.set('game_id', gameId.toString());

    if(!_.isNumber(round)) {
      round = parseInt(round);
    }
    game.set('round', round);

    if(!_.isNumber(indentifier)) {
      indentifier = parseInt(indentifier);
    }
    game.set('indentifier', indentifier);

    game.set('type', 2);

    game.save().then(function(result) {
        response.success("Saved Playoff Game with id = '" + gameId + "'");
    }, function(error) {
        response.error("Creating Playoff Game failed with error.code " + error.code + " error.message " + error.message);
    });
});

Parse.Cloud.define("savePlayoffGameResult", function(request, response) {
  /* global variables */
  var home_id = "";
  var away_id = "";

  home_goals_total = 0;
  away_goals_total = 0;

  var away_stats;
  var home_stats;

  var to_overtime;

  var POGame = Parse.Object.extend('POGame');
  var gameQuery = new Parse.Query(POGame);
  gameQuery.equalTo('game_id', request.params.game_id);
  gameQuery.include(['home.captain','home.lieutenant']);
  gameQuery.include(['away.captain','away.lieutenant']);
  gameQuery.find().then(function(result) {

    var home_captain_id = "";
    var home_lieutenant_id = "";

    var away_captain_id = "";
    var away_lieutenant_id = "";

    home_captain_id = result[0].get("home").get("captain").get("player_id");
    home_lieutenant_id = result[0].get("home").get("lieutenant").get("player_id");

    away_captain_id = result[0].get("away").get("captain").get("player_id");
    away_lieutenant_id = result[0].get("away").get("lieutenant").get("player_id");

    /** global **/
    to_overtime = false;

    /** home team **/
    var home_goals_p1 = 0;
    var home_goals_p2 = 0;
    var home_goals_p3 = 0;
    var home_goals_ot = 0;

    var home_faceoffs = 0;

    var home_shots_total = 0;

    var home_shots_p1 = 0;
    var home_shots_p2 = 0;
    var home_shots_p3 = 0;
    var home_shots_ot = 0;

    var home_captain_goals = 0;
    var home_captain_assists = 0;
    var home_captain_fights = 0;

    var home_lieutenant_goals = 0;
    var home_lieutenant_assists = 0;
    var home_lieutenant_fights = 0;

    if ((typeof(request.params.home_goals_p1) !== 'undefined') && (!_.isEmpty(request.params.home_goals_p1))) {
      home_goals_p1 = parseInt(request.params.home_goals_p1);
    }
    if ((typeof(request.params.home_goals_p2) !== 'undefined') && (!_.isEmpty(request.params.home_goals_p2))) {
      home_goals_p2 = parseInt(request.params.home_goals_p2);
    }
    if ((typeof(request.params.home_goals_p3) !== 'undefined') && (!_.isEmpty(request.params.home_goals_p3))) {
      home_goals_p3 = parseInt(request.params.home_goals_p3);
    }
    if ((typeof(request.params.home_goals_ot) !== 'undefined') && (!_.isEmpty(request.params.home_goals_ot))) {
      home_goals_ot = parseInt(request.params.home_goals_ot);
    }

    if ((typeof(request.params.home_faceoffs) !== 'undefined') && (!_.isEmpty(request.params.home_faceoffs))) {
      home_faceoffs = parseInt(request.params.home_faceoffs);
    }

    if ((typeof(request.params.home_shots_p1) !== 'undefined') && (!_.isEmpty(request.params.home_shots_p1))) {
      home_shots_p1 = parseInt(request.params.home_shots_p1);
    }
    if ((typeof(request.params.home_shots_p2) !== 'undefined') && (!_.isEmpty(request.params.home_shots_p2))) {
      home_shots_p2 = parseInt(request.params.home_shots_p2);
    }
    if ((typeof(request.params.home_shots_p3) !== 'undefined') && (!_.isEmpty(request.params.home_shots_p3))) {
      home_shots_p3 = parseInt(request.params.home_shots_p3);
    }
    if ((typeof(request.params.home_shots_ot) !== 'undefined') && (!_.isEmpty(request.params.home_shots_ot))) {
      home_shots_ot = parseInt(request.params.home_shots_ot);
    }

    if ((typeof(request.params.home_captain_goals) !== 'undefined') && (!_.isEmpty(request.params.home_captain_goals))) {
      home_captain_goals = parseInt(request.params.home_captain_goals);
    }
    if ((typeof(request.params.home_captain_assists) !== 'undefined') && (!_.isEmpty(request.params.home_captain_assists))) {
      home_captain_assists = parseInt(request.params.home_captain_assists);
    }
    if ((typeof(request.params.home_captain_fights) !== 'undefined') && (!_.isEmpty(request.params.home_captain_fights))) {
      home_captain_fights = parseInt(request.params.home_captain_fights);
    }

    if ((typeof(request.params.home_lieutenant_goals) !== 'undefined') && (!_.isEmpty(request.params.home_lieutenant_goals))) {
      home_lieutenant_goals = parseInt(request.params.home_lieutenant_goals);
    }
    if ((typeof(request.params.home_lieutenant_assists) !== 'undefined') && (!_.isEmpty(request.params.home_lieutenant_assists))) {
      home_lieutenant_assists = parseInt(request.params.home_lieutenant_assists);
    }
    if ((typeof(request.params.home_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.params.home_lieutenant_fights))) {
      home_lieutenant_fights = parseInt(request.params.home_lieutenant_fights);
    }

    /** away team **/
    var away_goals_p1 = 0;
    var away_goals_p2 = 0;
    var away_goals_p3 = 0;
    var away_goals_ot = 0;

    var away_shots_total = 0;

    var away_shots_p1 = 0;
    var away_shots_p2 = 0;
    var away_shots_p3 = 0;
    var away_shots_ot = 0;

    var away_faceoffs = 0;

    var away_captain_goals = 0;
    var away_captain_assists = 0;
    var away_captain_fights = 0;

    var away_lieutenant_goals = 0;
    var away_lieutenant_assists = 0;
    var away_lieutenant_fights = 0;

    if ((typeof(request.params.away_goals_p1) !== 'undefined') && (!_.isEmpty(request.params.away_goals_p1))) {
      away_goals_p1 = parseInt(request.params.away_goals_p1);
    }
    if ((typeof(request.params.away_goals_p2) !== 'undefined') && (!_.isEmpty(request.params.away_goals_p2))) {
      away_goals_p2 = parseInt(request.params.away_goals_p2);
    }
    if ((typeof(request.params.away_goals_p3) !== 'undefined') && (!_.isEmpty(request.params.away_goals_p3))) {
      away_goals_p3 = parseInt(request.params.away_goals_p3);
    }
    if ((typeof(request.params.away_goals_ot) !== 'undefined') && (!_.isEmpty(request.params.away_goals_ot))) {
      away_goals_ot = parseInt(request.params.away_goals_ot);
    }
    
    if ((typeof(request.params.away_faceoffs) !== 'undefined') && (!_.isEmpty(request.params.away_faceoffs))) {
      away_faceoffs = parseInt(request.params.away_faceoffs);
    }

    if ((typeof(request.params.away_shots_p1) !== 'undefined') && (!_.isEmpty(request.params.away_shots_p1))) {
      away_shots_p1 = parseInt(request.params.away_shots_p1);
    }
    if ((typeof(request.params.away_shots_p2) !== 'undefined') && (!_.isEmpty(request.params.away_shots_p2))) {
      away_shots_p2 = parseInt(request.params.away_shots_p2);
    }
    if ((typeof(request.params.away_shots_p3) !== 'undefined') && (!_.isEmpty(request.params.away_shots_p3))) {
      away_shots_p3 = parseInt(request.params.away_shots_p3);
    }
    if ((typeof(request.params.away_shots_ot) !== 'undefined') && (!_.isEmpty(request.params.away_shots_ot))) {
      away_shots_ot = parseInt(request.params.away_shots_ot);
    }

    if ((typeof(request.params.away_captain_goals) !== 'undefined') && (!_.isEmpty(request.params.away_captain_goals))) {
      away_captain_goals = parseInt(request.params.away_captain_goals);
    }
    if ((typeof(request.params.away_captain_assists) !== 'undefined') && (!_.isEmpty(request.params.away_captain_assists))) {
      away_captain_assists = parseInt(request.params.away_captain_assists);
    }
    if ((typeof(request.params.away_captain_fights) !== 'undefined') && (!_.isEmpty(request.params.away_captain_fights))) {
      away_captain_fights = parseInt(request.params.away_captain_fights);
    }

    if ((typeof(request.params.away_lieutenant_goals) !== 'undefined') && (!_.isEmpty(request.params.away_lieutenant_goals))) {
      away_lieutenant_goals = parseInt(request.params.away_lieutenant_goals);
    }
    if ((typeof(request.params.away_lieutenant_assists) !== 'undefined') && (!_.isEmpty(request.params.away_lieutenant_assists))) {
      away_lieutenant_assists = parseInt(request.params.away_lieutenant_assists);
    }
    if ((typeof(request.params.away_lieutenant_fights) !== 'undefined') && (!_.isEmpty(request.params.away_lieutenant_fights))) {
      away_lieutenant_fights = parseInt(request.params.away_lieutenant_fights);
    }

    home_goals_total = (home_goals_p1+home_goals_p2+home_goals_p3+home_goals_ot);
    home_shots_total = (home_shots_p1+home_shots_p2+home_shots_p3+home_shots_ot);

    result[0].set('home_goals_total',home_goals_total);
    result[0].set('home_shots_total',home_shots_total);
    result[0].set('home_faceoffs_total',home_faceoffs);

    away_goals_total = (away_goals_p1+away_goals_p2+away_goals_p3+away_goals_ot);
    away_shots_total = (away_shots_p1+away_shots_p2+away_shots_p3+away_shots_ot);

    result[0].set('away_goals_total',away_goals_total);
    result[0].set('away_shots_total',away_shots_total);
    result[0].set('away_faceoffs_total',away_faceoffs);

    var jsonDataHome = {};

    jsonDataHome["goals_p1"] = home_goals_p1;
    jsonDataHome["goals_p2"] = home_goals_p2;
    jsonDataHome["goals_p3"] = home_goals_p3;
    jsonDataHome["goals_ot"] = home_goals_ot;

    jsonDataHome["shots_p1"] = home_shots_p1;
    jsonDataHome["shots_p2"] = home_shots_p2;
    jsonDataHome["shots_p3"] = home_shots_p3;
    jsonDataHome["shots_ot"] = home_shots_ot;

    jsonDataHome["captain_id"] = home_captain_id;
    jsonDataHome["captain_goals"] = home_captain_goals;
    jsonDataHome["captain_assists"] = home_captain_assists;
    jsonDataHome["captain_fights"] = home_captain_fights;

    jsonDataHome["lieutenant_id"] = home_lieutenant_id;
    jsonDataHome["lieutenant_goals"] = home_lieutenant_goals;
    jsonDataHome["lieutenant_assists"] = home_lieutenant_assists;
    jsonDataHome["lieutenant_fights"] = home_lieutenant_fights;

    result[0].set('home_stats',jsonDataHome);

    var jsonDataAway = {};

    jsonDataAway["goals_p1"] = away_goals_p1;
    jsonDataAway["goals_p2"] = away_goals_p2;
    jsonDataAway["goals_p3"] = away_goals_p3;
    jsonDataAway["goals_ot"] = away_goals_ot;

    jsonDataAway["shots_p1"] = away_shots_p1;
    jsonDataAway["shots_p2"] = away_shots_p2;
    jsonDataAway["shots_p3"] = away_shots_p3;
    jsonDataAway["shots_ot"] = away_shots_ot;

    jsonDataAway["captain_id"] = away_captain_id;
    jsonDataAway["captain_goals"] = away_captain_goals;
    jsonDataAway["captain_assists"] = away_captain_assists;
    jsonDataAway["captain_fights"] = away_captain_fights;

    jsonDataAway["lieutenant_id"] = away_lieutenant_id;
    jsonDataAway["lieutenant_goals"] = away_lieutenant_goals;
    jsonDataAway["lieutenant_assists"] = away_lieutenant_assists;
    jsonDataAway["lieutenant_fights"] = away_lieutenant_fights;

    result[0].set('away_stats',jsonDataAway);

    home_stats = jsonDataHome;
    away_stats = jsonDataAway;

    var Team = Parse.Object.extend("Team");

    var obj_hometeam = new Team();
    obj_hometeam.id = result[0].get("home").id;

    var Team = Parse.Object.extend("Team");

    var obj_awayteam = new Team();
    obj_awayteam.id = result[0].get("away").id;

    home_id = obj_hometeam.id;
    away_id = obj_awayteam.id;

    if (home_goals_total > away_goals_total) {
      result[0].set('winner',obj_hometeam);
    } else {
      result[0].set('winner',obj_awayteam);
    }

    if ((home_goals_ot > 0) || (away_goals_ot > 0)) {
      to_overtime = true;
    }
    result[0].set('overtime',to_overtime);

    result[0].set('played',true);

    return result[0].save();

  }).then(function(result){
    console.log(result);
    console.log("Updating Home Captain ...");
    //Home Captain
    var h_c_id = home_stats.captain_id;
    var h_c_goals = home_stats.captain_goals;
    var h_c_assists = home_stats.captain_assists;
    var h_c_fights = home_stats.captain_fights;

    h_c_goals = h_c_goals.toString();
    h_c_assists = h_c_assists.toString();
    h_c_fights = h_c_fights.toString();

    return Parse.Cloud.run('updatePlayoffPlayerStats', {player_id: h_c_id, goals: h_c_goals, assists: h_c_assists, fights: h_c_fights});
  }).then(function(result){
    console.log(result);
    console.log("Updating Home Lieutenant ...");
    //Home Lieutenant
    var h_l_id = home_stats.lieutenant_id;
    var h_l_goals = home_stats.lieutenant_goals;
    var h_l_assists = home_stats.lieutenant_assists;
    var h_l_fights = home_stats.lieutenant_fights;

    h_l_goals = h_l_goals.toString();
    h_l_assists = h_l_assists.toString();
    h_l_fights = h_l_fights.toString();

    return Parse.Cloud.run('updatePlayoffPlayerStats', {player_id: h_l_id, goals: h_l_goals, assists: h_l_assists, fights: h_l_fights});
  }).then(function(result){
    console.log(result);
    console.log("Updating Away Captain ...");
    //Away Captain
    var a_c_id = away_stats.captain_id;
    var a_c_goals = away_stats.captain_goals;
    var a_c_assists = away_stats.captain_assists;
    var a_c_fights = away_stats.captain_fights;

    a_c_goals = a_c_goals.toString();
    a_c_assists = a_c_assists.toString();
    a_c_fights = a_c_fights.toString();

    return Parse.Cloud.run('updatePlayoffPlayerStats', {player_id: a_c_id, goals: a_c_goals, assists: a_c_assists, fights: a_c_fights});
  }).then(function(result){
    console.log(result);
    console.log("Updating Away Lieutenant ...");
    //Away Lieutenant
    var a_l_id = away_stats.lieutenant_id;
    var a_l_goals = away_stats.lieutenant_goals;
    var a_l_assists = away_stats.lieutenant_assists;
    var a_l_fights = away_stats.lieutenant_fights;

    a_l_goals = a_l_goals.toString();
    a_l_assists = a_l_assists.toString();
    a_l_fights = a_l_fights.toString();

    return Parse.Cloud.run('updatePlayoffPlayerStats', {player_id: a_l_id, goals: a_l_goals, assists: a_l_assists, fights: a_l_fights});
  }).then(function(result){
    response.success("Saved result for Playoff Game with id '" + request.params.game_id + "'");
  }, function(error) {
    response.error("Saving result for Playoff Game with id '" + request.params.game_id + "' failed with error.code " + error.code + " error.message " + error.message);
  });
});
/**
Parse.Cloud.define("getPlayoffTeams", function(request, response) {
  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.descending('points,difference,goals_for,games_played');
  standingsQuery.include(["team.nhlTeam"]);
  standingsQuery.limit(8);
  standingsQuery.find().then(function(result) {
    response.success(result);
  }, function(error) {
    response.error("Getting Playoff Teams failed with error.code " + error.code + " error.message " + error.message);
  });
});
**/
/** End Playoff Games **/

/*
Parse.Cloud.afterSave("Game", function(request) {
  var type = request.object.get("type");
  var played = request.object.get("played");

  if ((typeof(type) !== 'undefined' && (typeof(played) !== 'undefined') && played && type === 1) ) {
    var overtime = request.object.get("overtime");

    var home_goals_total = request.object.get("home_goals_total");
    var home_id = request.object.get("home").id;

    var away_goals_total = request.object.get("away_goals_total");
    var away_id = request.object.get("away").id;

    home_goals_total = home_goals_total.toString();
    away_goals_total = away_goals_total.toString();

    var away_stats = request.object.get("away_stats");
    var home_stats = request.object.get("home_stats");

    Parse.Cloud.run('updateStandingForTeam', {"team_objectId":home_id,"goals_for":home_goals_total,"goals_against":away_goals_total,"overtime":overtime}).then(function(result){
      console.log(result);
      return Parse.Cloud.run('updateStandingForTeam', {"team_objectId":away_id,"goals_for":away_goals_total,"goals_against":home_goals_total,"overtime":overtime});
    }).then(function(result){
      console.log(result);
      console.log("Updating Home Captain ...");
      //Home Captain
      var h_c_id = home_stats.captain_id;
      var h_c_goals = home_stats.captain_goals;
      var h_c_assists = home_stats.captain_assists;
      var h_c_fights = home_stats.captain_fights;

      h_c_goals = h_c_goals.toString();
      h_c_assists = h_c_assists.toString();
      h_c_fights = h_c_fights.toString();

      return Parse.Cloud.run('updatePlayerStats', {player_id: h_c_id, goals: h_c_goals, assists: h_c_assists, fights: h_c_fights});
    }).then(function(result){
      console.log(result);
      console.log("Updating Home Lieutenant ...");
      //Home Lieutenant
      var h_l_id = home_stats.lieutenant_id;
      var h_l_goals = home_stats.lieutenant_goals;
      var h_l_assists = home_stats.lieutenant_assists;
      var h_l_fights = home_stats.lieutenant_fights;

      h_l_goals = h_l_goals.toString();
      h_l_assists = h_l_assists.toString();
      h_l_fights = h_l_fights.toString();

      return Parse.Cloud.run('updatePlayerStats', {player_id: h_l_id, goals: h_l_goals, assists: h_l_assists, fights: h_l_fights});
    }).then(function(result){
      console.log(result);
      console.log("Updating Away Captain ...");
      //Away Captain
      var a_c_id = away_stats.captain_id;
      var a_c_goals = away_stats.captain_goals;
      var a_c_assists = away_stats.captain_assists;
      var a_c_fights = away_stats.captain_fights;

      a_c_goals = a_c_goals.toString();
      a_c_assists = a_c_assists.toString();
      a_c_fights = a_c_fights.toString();

      return Parse.Cloud.run('updatePlayerStats', {player_id: a_c_id, goals: a_c_goals, assists: a_c_assists, fights: a_c_fights});
    }).then(function(result){
      console.log(result);
      console.log("Updating Away Lieutenant ...");
      //Away Lieutenant
      var a_l_id = away_stats.lieutenant_id;
      var a_l_goals = away_stats.lieutenant_goals;
      var a_l_assists = away_stats.lieutenant_assists;
      var a_l_fights = away_stats.lieutenant_fights;

      a_l_goals = a_l_goals.toString();
      a_l_assists = a_l_assists.toString();
      a_l_fights = a_l_fights.toString();

      return Parse.Cloud.run('updatePlayerStats', {player_id: a_l_id, goals: a_l_goals, assists: a_l_assists, fights: a_l_fights});
    }).then(function(result){
      console.log(result);
    }, function(error){
      throw error;
    });
  }
});
*/

Parse.Cloud.define("updateStandingForTeam", function(request, response) {
  var Team = Parse.Object.extend("Team");
  var team = new Team();
  team.id = request.params.team_objectId;

  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.equalTo("team",team);
  standingsQuery.find().then(function(result) {
    var goals_for = 0;
    var goals_against = 0;
    var overtime = false;

    if ((typeof(request.params.goals_for) !== 'undefined') && (!_.isEmpty(request.params.goals_for))) {
      goals_for = parseInt(request.params.goals_for);
    }
    if ((typeof(request.params.goals_against) !== 'undefined') && (!_.isEmpty(request.params.goals_against))) {
      goals_against = parseInt(request.params.goals_against);
    }
    if ((typeof(request.params.overtime) !== 'undefined') && (!_.isEmpty(request.params.overtime))) {
      overtime = (request.params.overtime === 'true');
    }
    /*
    console.log("goals_for = '" + goals_for + "'");
    console.log("goals_against = '" + goals_against + "'");
    console.log("overtime = '" + overtime + "'");
    */
    if (goals_for === goals_against) {
      console.log("If the goals For and Against are the same we can't determine a winner. goals_for: '" + goals_for + "' and goals_against: '" + goals_against + "'");
      response.error("If the goals For and Against are the same we can't determine a winner. goals_for: '" + goals_for + "' and goals_against: '" + goals_against + "'");
    }

    var wins = result[0].get("wins");
    var losses = result[0].get("losses");
    var ot_losses = result[0].get("ot_losses");

    var db_goals_for = result[0].get("goals_for");
    db_goals_for = db_goals_for + goals_for;

    var db_goals_against = result[0].get("goals_against");
    db_goals_against = db_goals_against + goals_against;

    var points = result[0].get("points");

    var games_played = result[0].get("games_played");
    games_played = games_played + 1;

    if (goals_for > goals_against) {
      wins = wins + 1;
      points = points + 2;

      result[0].set('wins',wins);
    } else {
      if (overtime) {
        ot_losses = ot_losses + 1;
        points = points + 1;

        result[0].set('ot_losses',ot_losses);
      } else {
        losses = losses + 1;
        result[0].set('losses',losses);
      }
    }

    result[0].set('games_played',games_played);
    
    result[0].set('points',points);

    result[0].set('goals_for',db_goals_for);
    result[0].set('goals_against',db_goals_against);

    return result[0].save();

  }).then(function(result) {
    response.success("Saved Standing for Team with objectId '" + request.params.team_objectId + "'");
  }, function(error) {
    response.error("Saving Standing for Team with objectId '" + request.params.team_objectId + "' failed with error.code " + error.code + " error.message " + error.message);
  });
});

Parse.Cloud.define("updatePlayerStats", function(request, response) {
  var player_name = "";

  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.equalTo("player_id",request.params.player_id);
  playerQuery.find().then(function(result) {
    player_name = result[0].get("name");

    var goals = 0;
    var assists = 0;
    var fights = 0;

    if ((typeof(request.params.goals) !== 'undefined') && (!_.isEmpty(request.params.goals))) {
      goals = parseInt(request.params.goals);
    }
    if ((typeof(request.params.assists) !== 'undefined') && (!_.isEmpty(request.params.assists))) {
      assists = parseInt(request.params.assists);
    }
    if ((typeof(request.params.fights) !== 'undefined') && (!_.isEmpty(request.params.fights))) {
      fights = parseInt(request.params.fights);
    }
    /*
    console.log("goals = '" + goals + "'");
    console.log("assists = '" + assists + "'");
    console.log("fights = '" + fights + "'");
    */
    var db_goals = result[0].get("goals");
    var db_assists = result[0].get("assists");
    var db_fights = result[0].get("fights");

    var db_points = result[0].get("points");

    db_goals = db_goals + goals;
    db_assists = db_assists + assists;
    db_fights = db_fights + fights;

    db_points = db_points + (goals + assists);

    result[0].set('goals',db_goals);
    result[0].set('assists',db_assists);
    result[0].set('points',db_points);
    result[0].set('fights',db_fights);

    return result[0].save();

  }).then(function(result) {
    response.success("Saved Stats for Player with id '" + request.params.player_id + "' and name '" + player_name + "'");
  }, function(error) {
    response.error("Saving Stats for Player with id '" + request.params.player_id + "' failed with error.code " + error.code + " error.message " + error.message);
  });
});

Parse.Cloud.define("updatePlayoffPlayerStats", function(request, response) {
  var player_name = "";

  var Player = Parse.Object.extend('Player');
  var playerQuery = new Parse.Query(Player);
  playerQuery.equalTo("player_id",request.params.player_id);
  playerQuery.find().then(function(result) {
    player_name = result[0].get("name");

    var goals = 0;
    var assists = 0;
    var fights = 0;

    if ((typeof(request.params.goals) !== 'undefined') && (!_.isEmpty(request.params.goals))) {
      goals = parseInt(request.params.goals);
    }
    if ((typeof(request.params.assists) !== 'undefined') && (!_.isEmpty(request.params.assists))) {
      assists = parseInt(request.params.assists);
    }
    if ((typeof(request.params.fights) !== 'undefined') && (!_.isEmpty(request.params.fights))) {
      fights = parseInt(request.params.fights);
    }
    /*
    console.log("goals = '" + goals + "'");
    console.log("assists = '" + assists + "'");
    console.log("fights = '" + fights + "'");
    */
    var db_po_goals = result[0].get("po_goals");
    var db_po_assists = result[0].get("po_assists");
    var db_po_fights = result[0].get("po_fights");

    var db_po_points = result[0].get("po_points");

    db_po_goals = db_po_goals + goals;
    db_po_assists = db_po_assists + assists;
    db_po_fights = db_po_fights + fights;

    db_po_points = db_po_points + (goals + assists);

    result[0].set('po_goals',db_po_goals);
    result[0].set('po_assists',db_po_assists);
    result[0].set('po_points',db_po_points);
    result[0].set('po_fights',db_po_fights);

    return result[0].save();

  }).then(function(result) {
    response.success("Saved Playoff Stats for Player with id '" + request.params.player_id + "' and name '" + player_name + "'");
  }, function(error) {
    response.error("Saving Playoff Stats for Player with id '" + request.params.player_id + "' failed with error.code " + error.code + " error.message " + error.message);
  });
});

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
   response.success("Player stats successfully cleaned");
  }, function(error) {
    response.error("Cleaning Player stats failed with error.code " + error.code + " error.message " + error.message);
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

/** -- Order -- **/
Parse.Cloud.beforeSave("Order", function(request, response) {
  var price = request.object.get("price");
  price = price.replace(/\D/g,'');
  request.object.set('price', price);

  var size = request.object.get("size");

  if (
    (_.isEqual(size, "S")) ||
    (_.isEqual(size, "M")) ||
    (_.isEqual(size, "L")) ||
    (_.isEqual(size, "XL")) ||
    (_.isEqual(size, "XXL"))) 
  {
    response.success();
  } else {
    response.error("A non valid size marker was entered");
  }
});

Parse.Cloud.afterSave("Order", function(request, response) {
  var email = request.object.get("email");
  var name = request.object.get("name");
  var price = request.object.get("price");
  var size = request.object.get("size");

  mailgun.sendEmail({
    to: name + " <" + email + ">",
    bcc: "Joel Baudin <joel.baudin88@gmail.com>",
    from: "Cobra Cup 2016 <joel@cobracup.se>",
    subject: "Anton Hatar T-Shirt - Tack för din beställning och bidrag!",
    html: "<html><h3>Din beställning av en Anton Hatar T-Shirt är mottagen!</h3><p>Du har beställt en T-Shirt med storlek <b>" + size + "</b> och valt att betala <b>" + price + " kr</b> för den.</p><p><h3>Betalning</h3>Betalning sker enklast via Swish till <b>070 566 64 21</b>. Märk din betalning med <b>AH + ditt namn</b>.<br>Om du inte har Swish eller inte vill använda dig av det ber jag dig kontakta mig för att få kontonummer.<br><br>Om det är några frågor tveka inte att kontakta oss på joel@cobracup.se.</p><p>Tack för ditt bidrag!<br><br>Med vänlig hälsning<br>Joel & David<br>www.cobracup.se</p></html>"
  }).then(function(result) {
      response.success();
  }, function(error) {
      response.error("Sending email failed with error.code " + error.code + " error.message " + error.message);
  });

});

Parse.Cloud.define("placeOrder", function(request, response) {
    var Order = Parse.Object.extend("Order");
    var order = new Order();

    var email = request.params.email;
    var telephone = request.params.telephone;
    var name = request.params.name;
    var size = request.params.size;
    var type = request.params.type;
    var price = request.params.price;

    if (
        (typeof(email) === 'undefined') || 
        (typeof(telephone) === 'undefined') || 
        (typeof(name) === 'undefined') || 
        (typeof(price) === 'undefined') || 
        (typeof(size) === 'undefined') ||
        (typeof(type) === 'undefined') || 
        (_.isEmpty(email)) ||
        (_.isEmpty(telephone)) ||
        (_.isEmpty(name)) ||
        (_.isEmpty(price)) ||
        (_.isEmpty(size)) ||
        (_.isEmpty(type))) 
    {
      response.error("One or more mandatory field was missing. Can't save Order.");
    }

    if ((typeof(request.params.player) !== 'undefined') && (!_.isEmpty(request.params.player))) {
      var Player = Parse.Object.extend("Player");
      var player = new Player();
      player.id = request.params.player;

      order.set('player', player);
    }

    order.set('email', email);
    order.set('telephone', telephone);
    order.set('name', name);
    order.set('price', price);
    order.set('size', size);
    order.set('type', type);

    order.save().then(function(result) {
        response.success("Saved the Order with objectId = " + result.id);
    }, function(error) {
        response.error("Saving Order failed with error.code " + error.code + " error.message " + error.message);
    });
});