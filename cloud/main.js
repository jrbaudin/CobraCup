require('cloud/app.js');

Parse.Cloud.afterSave("Team", function(request) {
	var teamId = request.object.id;
	var captain_name = request.object.get("captain_name");
	var lieutenant_name = request.object.get("lieutenant_name");

	var Team = Parse.Object.extend("Team");
	var teamObj = new Team();
	teamObj.id = teamId;

	var PlayerStats = Parse.Object.extend("PlayerStats");
	var playerStatCaptain = new PlayerStats();

	playerStatCaptain.set('player_name', captain_name);
	playerStatCaptain.set('player_team', teamObj);
	playerStatCaptain.set('player_goals', "0");
	playerStatCaptain.set('player_fights', "0");
	playerStatCaptain.save().then(function(playerStat) {
		console.log("Successfully saved CAPTAIN player stat object");
	}, function(error) {
		console.error("Failed saving CAPTAIN player stat object");
		console.error(error);
	});

	var playerStatLieutenant = new PlayerStats();

	playerStatLieutenant.set('player_name', lieutenant_name);
	playerStatLieutenant.set('player_team', teamObj);
	playerStatLieutenant.set('player_goals', "0");
	playerStatLieutenant.set('player_fights', "0");
	playerStatLieutenant.save().then(function(playerStat) {
		console.log("Successfully saved LIEUTENANT player stat object");
	}, function(error) {
	  	console.error("Failed saving LIEUTENANT player stat object");
		console.error(error);
	});
});