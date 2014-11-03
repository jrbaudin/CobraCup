var _ = require('underscore');
Parse.Cloud.define("getConfig", function(request, response) {
    Parse.Config.get().then(function(config) {
      //console.log("Yay! Config was fetched from the server.");
      response.success(config);
    }, function(error) {
      console.error("Failed to fetch. Using Cached Config.");
      var config = Parse.Config.current();
      if (!_.isEmpty(config)) {
        console.log("Succesfully fetched the Cached Config! Winning!");
        response.success(config);
      } else {
        console.error("The Cached Config was empty, damn!");
        response.error(error);
      }
    });
});
 
require('cloud/app.js');