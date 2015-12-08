var _ = require('underscore');

exports.loadVoteForm = function(request, response) {
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
	  		allTeams: arrTeams
		});

	}, function(error){
	  alert(error);
	  response.error("Getting Players and Teams failed with error.code " + error.code + " error.message " + error.message);
	  response.render('vote', {
	    flashError: ('Problem när den önskade datan skulle hämtas: ' + error.message)
	  });
	});
};