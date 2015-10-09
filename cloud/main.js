require('cloud/app.js');
var _ = require('underscore');
var twitter = require('cloud/modules/twitter.js');

Parse.Cloud.define("sendTweet", function(request, response) {
	twitter.request({
	    url: 'statuses/update',
	    params: {
	    	status: request.params.status
	    }
	}).then(function(httpResponse) {
		console.log('sendTweet(): ' + httpResponse.text);
	  	response.success("Tweet succesfully sent");
	}, function(httpResponse) {
		console.log('sendTweet(): Request failed with response code ' + httpResponse.status);
		console.log('sendTweet(): Response text: ' + httpResponse.text);
    	response.error('Sending Tweet failed with response code ' + httpResponse.status);
    });
});

Parse.Cloud.define("createPlayer", function(request, response) {
	Parse.Cloud.useMasterKey();
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
    console.log("main.js: request: " + request);
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
	      	// Return a promise that will be resolved when the save is finished.
	      	return savedLieutenant.save();
    	});
    	return promise;
  		
  	}).then(function(){
  		var promise = Parse.Promise.as();

  		var NHLTeam = Parse.Object.extend('NHLTeam');
	    var nhlTeamQuery = new Parse.Query(NHLTeam);
	    nhlTeamQuery.equalTo('objectId', nhlTeam);
	    console.log("query: " + JSON.stringify(nhlTeamQuery));
  		nhlTeamQuery.find().then(function(nhlTeamToUpdate) {
  			console.log("do we get here?");
  			console.log("found this team: " + JSON.stringify(nhlTeamToUpdate));
  		    nhlTeamToUpdate[0].set('taken', true);
    	    promise = promise.then(function() {
    	      	// Return a promise that will be resolved when the save is finished.
    	      	console.log("defining promise...");
    	      	return nhlTeamToUpdate[0].save();
        	});
  		}, function(error) {
  			console.log("Couldn't find any NHLTeam and error.code " + error.code + " error.message " + error.message);
  		});
  		console.log("Ready to return ... ");

  		return promise;
  	}).then(function(){
		response.success("Added new PRO/ALLSTAR team and updated NHL Team with taken status");
  	}, function(error) {
    	response.error("Creating Rookie team failed with error.code " + error.code + " error.message " + error.message);
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

  	/*** Legacy ***/
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
  	/**** END Legacy ***/

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
  		var promise = Parse.Promise.as();

  		var NHLTeam = Parse.Object.extend('NHLTeam');
  		var nhlTeamQuery = new Parse.Query(NHLTeam);
  		nhlTeamQuery.equalTo('objectId', nhlTeam);
  		nhlTeamQuery.find().then(function(nhlTeamToUpdate) {
  		    nhlTeamToUpdate[0].set('taken_rookie', true);
    	    promise = promise.then(function() {
    	      	// Return a promise that will be resolved when the save is finished.
    	      	return nhlTeamToUpdate[0].save();
        	});
  		});

  		return promise;
  	}).then(function(){
		response.success("Added new Rookie team and updated NHL Team with taken status");
  	}, function(error) {
    	response.error("Creating Rookie team failed with error.code " + error.code + " error.message " + error.message);
  	});
});
/*** EMD Create Rookie Team ***/

/* ----------- */

/***** Utility Functions *****/

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

Parse.Cloud.define("cleanPlayerStats", function(request, response) {
	var PlayerStats = Parse.Object.extend('PlayerStats');
	var playerStatsQuery = new Parse.Query(PlayerStats);
	playerStatsQuery.find().then(function(results) {
	  	var promise = Parse.Promise.as();
	  	_.each(results, function(result) {
		  	// For each item, extend the promise with a function to save it.
		    result.set('player_fights', 0);
		    result.set('player_goals', 0);
		    promise = promise.then(function() {
		      	// Return a promise that will be resolved when the save is finished.
		      	return result.save();
	    	});
	  	});

	  	return promise;

	}).then(function() {
	    response.success("PlayerStats table is cleaned");
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
	  	// Every object is updated.
	}, function(error){
		response.error("Script failed with error.code " + error.code + " error.message " + error.message);
	});
});