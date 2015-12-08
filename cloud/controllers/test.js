var _ = require('underscore');

exports.load = function(request, response) {

	var Player = Parse.Object.extend('Player');
	var playersQuery = new Parse.Query(Player);
	playersQuery.descending('name');
	playersQuery.include("team.nhlTeam");
	playersQuery.find().then(function(players) {

		var arrPlayers = [];

	  	players.forEach(function(player){
	      	console.log("name: " + player.get("name"));
	      	var temp = {
	      		value: player.get("player_id"),
	      		label: player.get("name"),
	      		team: player.get("team").get("team_name")
	      	};
	      	arrPlayers.push(temp);
	  	});

	  	response.render('test', {
	    	allPlayers: arrPlayers
	  	});

	}, function(error){
	  alert(error);
	  response.error("Getting Player Stats data failed with error.code " + error.code + " error.message " + error.message);
	  response.render('playerstats', {
	    flashError: ('Problem när den önskade datan skulle hämtas: ' + error.message)
	  });
	});
};