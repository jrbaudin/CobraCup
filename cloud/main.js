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