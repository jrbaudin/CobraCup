require('cloud/app.js');
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