var _ = require('underscore');

exports.loadAwards = function(request, response) {
	var passedErrorVariable = request.query.error;
  	var passedInfoVariable = request.query.info;

	var votes;
	var players;

	var gandalf = [];
	var gandalfVotes = [];

	var hulk = [];
	var hulkVotes = [];

	var skroder = [];
	var skroderVotes = [];

	var joffrey = [];
	var joffreyVotes = [];

	var stig = [];
	var stigVotes = [];

	var tim = [];
	var timVotes = [];

	var Vote = Parse.Object.extend('Vote');
	var votesQuery = new Parse.Query(Vote);
	votesQuery.find().then(function(result) {

		votes = result;		

		votes.forEach(function(vote){
			gandalf.push(vote.get("gandalf"));
			hulk.push(vote.get("hulk"));
			skroder.push(vote.get("skroder"));
			joffrey.push(vote.get("joffrey"));
			stig.push(vote.get("stig"));
			tim.push(vote.get("tim"));
		});


		var Player = Parse.Object.extend('Player');
		var playersQuery = new Parse.Query(Player);
		playersQuery.descending('name');
		playersQuery.include("team.nhlTeam");

		return playersQuery.find();

	}).then(function(result){

		players = result;

		players.forEach(function(player){
		  var pid = parseInt(player.get("player_id"));
		  var name = player.get("name");
		  var image = player.get("avatar").url();

		  var count = 0;
		  gandalf.forEach(function(id){
		    var temp_id = parseInt(id);
		    if(_.isEqual(temp_id, pid)){
		      count = count+1;
		    }
		  });
		  var player = {
		      "name": name,
		      "votes": count,
		      "image": image,
		      "id": pid
		  }
		  gandalfVotes.push(player);

		  count = 0;
		  hulk.forEach(function(id){
		    var temp_id = parseInt(id);
		    if(_.isEqual(temp_id, pid)){
		      count = count+1;
		    }
		  });
		  player = {
		      "name": name,
		      "votes": count,
		      "image": image,
		      "id": pid  
		  }
		  hulkVotes.push(player);

		  count = 0;
		  skroder.forEach(function(id){
		    var temp_id = parseInt(id);
		    if(_.isEqual(temp_id, pid)){
		      count = count+1;
		    }
		  });
		  player = {
		      "name": name,
		      "votes": count,
		      "image": image,
		      "id": pid 
		  }
		  skroderVotes.push(player);

		  count = 0;
		  joffrey.forEach(function(id){
		    var temp_id = parseInt(id);
		    if(_.isEqual(temp_id, pid)){
		      count = count+1;
		    }
		  });
		  player = {
		      "name": name,
		      "votes": count,
		      "image": image,
		      "id": pid 
		  }
		  joffreyVotes.push(player);

		  count = 0;
		  stig.forEach(function(id){
		    var temp_id = parseInt(id);
		    if(_.isEqual(temp_id, pid)){
		      count = count+1;
		    }
		  });
		  player = {
		      "name": name,
		      "votes": count,
		      "image": image,
		      "id": pid 
		  }
		  stigVotes.push(player);

		});
		
		//Sort the votes lists
		gandalfVotes = _.sortBy(gandalfVotes, function(player){
		    return player.votes;
		});
		gandalfVotes = gandalfVotes.reverse();

		hulkVotes = _.sortBy(hulkVotes, function(player){
		    return player.votes;
		});
		hulkVotes = hulkVotes.reverse();

		skroderVotes = _.sortBy(skroderVotes, function(player){
		    return player.votes;
		});
		skroderVotes = skroderVotes.reverse();

		joffreyVotes = _.sortBy(joffreyVotes, function(player){
		    return player.votes;
		});
		joffreyVotes = joffreyVotes.reverse();

		stigVotes = _.sortBy(stigVotes, function(player){
		    return player.votes;
		});
		stigVotes = stigVotes.reverse();
		/** --- **/

		var Team = Parse.Object.extend('Team');
		var teamsQuery = new Parse.Query(Team);
		teamsQuery.descending('name');
		teamsQuery.include("nhlTeam");

		return teamsQuery.find();

	}).then(function(result){

		var teams = result; 

		teams.forEach(function(team){
			var pid = parseInt(team.get("team_id"));
			var name = team.get("team_name");
			var image = team.get("nhlTeam").get("logo").url();

			var count = 0;
			tim.forEach(function(id){
			  var temp_id = parseInt(id);
			  if(_.isEqual(temp_id, pid)){
			    count = count+1;
			  }
			});
			var team = {
			    "name": name,
			    "votes": count,
			    "image": image,
			    "id": pid 
			}
			timVotes.push(team);
		});

		timVotes = _.sortBy(timVotes, function(team){
		    return team.votes;
		});
		timVotes = timVotes.reverse();

		response.render('awards', {
	  		votes: votes,
	  		players: players,
	  		teams: teams,
	  		gandalf: gandalfVotes,
	  		hulk: hulkVotes,
	  		skroder: skroderVotes,
	  		joffrey: joffreyVotes,
	  		stig: stigVotes,
	  		tim: timVotes,
	  		flashError: passedErrorVariable,
      		flashInfo: passedInfoVariable
		});

	}, function(error){
	  response.render('awards', {
	    flashError: ('Problem när den önskade datan skulle hämtas: ' + error.message)
	  });
	});
};

exports.loadVoteForm = function(request, response) {
	var passedErrorVariable = request.query.error;
  	var passedInfoVariable = request.query.info;

	var arrPlayers = [];

	var Player = Parse.Object.extend('Player');
	var playersQuery = new Parse.Query(Player);
	playersQuery.descending('name');
	playersQuery.include("team.nhlTeam");
	playersQuery.find().then(function(players) {

		players.forEach(function(player){
	    	var temp = {
	    		value: player.get("player_id"),
	    		label: player.get("name"),
	    		team: player.get("team").get("team_name")
	    	};
	    	arrPlayers.push(temp);
		});

		var Team = Parse.Object.extend('Team');
		var teamQuery = new Parse.Query(Team);

		return teamQuery.find();

	}).then(function(teams){

		var arrTeams = [];
		teams.forEach(function(team){
	    	var temp = {
	    		value: team.get("team_id"),
	    		label: team.get("team_name"),
	    	};
	    	arrTeams.push(temp);
		});

		response.render('vote', {
	  		allPlayers: arrPlayers,
	  		allTeams: arrTeams,
	  		flashError: passedErrorVariable,
      		flashInfo: passedInfoVariable
		});

	}, function(error){
	  response.render('vote', {
	    flashError: ('Problem när den önskade datan skulle hämtas: ' + error.message)
	  });
	});
};

// Save the vote
exports.saveVote = function(request, response) {
  var voter = "";
  var gandalf = "";
  var hulk = "";
  var skroder = "";
  var joffrey = "";
  var stig = "";
  var tim = "";

  //Captain
  if ((typeof(request.body.voterid) !== 'undefined') && (!_.isEmpty(request.body.voterid))) {
    voter = request.body.voterid;
  }
  if ((typeof(request.body.gandalfid) !== 'undefined') && (!_.isEmpty(request.body.gandalfid))) {
    gandalf = request.body.gandalfid;
  }
  if ((typeof(request.body.hulkid) !== 'undefined') && (!_.isEmpty(request.body.hulkid))) {
    hulk = request.body.hulkid;
  }
  if ((typeof(request.body.skroderid) !== 'undefined') && (!_.isEmpty(request.body.skroderid))) {
    skroder = request.body.skroderid;
  }
  if ((typeof(request.body.joffreyid) !== 'undefined') && (!_.isEmpty(request.body.joffreyid))) {
    joffrey = request.body.joffreyid;
  }
  if ((typeof(request.body.stighelmerid) !== 'undefined') && (!_.isEmpty(request.body.stighelmerid))) {
    stig = request.body.stighelmerid;
  }
  if ((typeof(request.body.timgunnid) !== 'undefined') && (!_.isEmpty(request.body.timgunnid))) {
    tim = request.body.timgunnid;
  }

  Parse.Cloud.run('saveVote', { voter: voter, gandalf: gandalf, hulk: hulk, skroder: skroder, joffrey: joffrey, stig: stig, tim: tim }).then(function(result){
  	var info_msg = encodeURIComponent("Din röst i Cobra Cup Awards är nu sparad! Tack för ditt deltagande!");
  	response.redirect('/awards' + '?info=' + info_msg);
  }, function(error){
  	var error_msg = encodeURIComponent("Fel uppstod när din röst skulle sparas skulle sparas. Meddelande: '" + error.message + "'");
  	response.redirect('/awards' + '?error=' + error_msg);
  });
};