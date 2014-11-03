var Mailgun = require('mailgun');
Mailgun.initialize('mg.skipool.nu', 'key-bc14dd14e4c28a20da1bdbc5f5f1223a');

// Display the homepage.
exports.index = function(req, res) {
  var Event = Parse.Object.extend('Event');
  var eventQuery = new Parse.Query(Event);
  eventQuery.equalTo('objectId', 'U8FTORaSl4');
  eventQuery.find().then(function(theEvent) {
    if (theEvent) {
      var available = theEvent[0].get('available');
      if(available > 0){
        var worker = Parse.Object.extend('Worker');
        var workerQuery = new Parse.Query(worker);
        workerQuery.descending('createdAt');
        workerQuery.find().then(function(results) {
          res.render('signup', { 
            workers: results
          });
        },
        function() {
          res.send(500, 'Failed loading workers');
        });
      } else {
        var worker = Parse.Object.extend('Worker');
        var workerQuery = new Parse.Query(worker);
        workerQuery.descending('createdAt');
        workerQuery.find().then(function(results) {
          res.render('signup', { 
            workers: results,
            full: true
          });
        },
        function() {
          res.send(500, 'Failed loading workers');
        });
      }
    } else {
      res.render('signup', {flash: 'det var problem att ladda sidan. Kontakta admin.'});
    }
  },
  function() {
    res.send(500, 'Failed finding event to update');
  });
};
 
// Create a new user with specified information.
exports.signup = function(req, res) {
  var Event = Parse.Object.extend('Event');
  var eventQuery = new Parse.Query(Event);
  eventQuery.equalTo('objectId', 'U8FTORaSl4');
  eventQuery.find().then(function(theEvent) {
    if (theEvent) {
      var available = theEvent[0].get('available');
      if(available > 0){
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var telephone = req.body.telephone;
        var password = "test";

        var Worker = Parse.Object.extend("Worker");
        var worker = new Worker();

        //Worker information
        worker.set('firstname', firstname);
        worker.set('lastname', lastname);
        worker.set('telephone', telephone);
        worker.set('email', email);
        worker.set('password', password);

        var Event = Parse.Object.extend('Event');
        var event = new Event();
        event.id = "U8FTORaSl4";
         
        worker.set("parent", event);

        worker.save().then(function(worker) {
          theEvent[0].set('available', available-1);
          theEvent[0].save().then(function(theEvent) {
            console.log('Managed to save the worker and the event... yippiee');
            Mailgun.sendEmail({
              to: "Admin <johanna.epettersson@gmail.com>",
              from: "Snömässan 2014 <kontakt@mg.skipool.nu>",
              subject: "En person har anmält sig till att jobba på Snömässan 2014",
              html: "<html><h3>En anmälan har kommit in!</h3> <p>Det här är ett automatiskt genererat mail för att meddela dig att <b>" + firstname + " " + lastname + "</b> har skrivit upp sig för att jobba på Snömässan.</p> <p>Om du vill kontakta <b>" + firstname + "</b> använd dessa uppgifter:<br>Mejladress: " + email + "<br>Telefonnummer: " + telephone + "</p><p>Tack för att du använder dig av denna sida!<br><br>Med vänlig hälsning<br>Joel<br>www.joelbaudin.com</p></html>"
            }, {
              success: function(httpResponse) {
                console.log('SendEmail success response: ' + httpResponse);
                res.redirect('/');
              },
              error: function(httpResponse) {
                console.error('SendEmail error response: ' + httpResponse);
                res.redirect('/');
              }
            });

            if((available-1)==0){
              Mailgun.sendEmail({
                to: "Admin <johanna.epettersson@gmail.com>",
                from: "Snömässan 2014 <kontakt@mg.skipool.nu>",
                subject: "Alla platser för att jobba på Snömässan är nu bokade",
                html: "<html><h3>Det är fullbokat!</h3> <p>Det här är ett automatiskt genererat mail för att meddela dig att alla 10 platser för att jobba på Snömässan nu är bokade</p> <p>Tack för att du använder dig av denna sida!<br><br>Med vänlig hälsning<br>Joel<br>www.joelbaudin.com</p></html>"
              }, {
                success: function(httpResponse) {
                  console.log('SendEmail success response: ' + httpResponse);
                  res.redirect('/');
                },
                error: function(httpResponse) {
                  console.error('SendEmail error response: ' + httpResponse);
                  res.redirect('/');
                }
              });
            }
          }, function(error) {
            // Show the error message and let the user try again
            console.error('Could not save the event..');
            console.error(error);
            res.render('signup', {flash: error.message});
          });
        }, function(error) {
          // Show the error message and let the user try again
          console.error('FAIL! wah wah wah...');
          console.error(error);
          res.render('signup', {flash: error.message});
        });
      }
    }
  },
  function() {
    res.send(500, 'Failed finding event to update');
  });
};
 
// Delete a worker corresponding to the specified id.
exports.delete = function(req, res) {
  var Worker = Parse.Object.extend('Worker');
  var workerQuery = new Parse.Query(Worker);
  workerQuery.equalTo('firstname', req.params.objectId);
  workerQuery.find().then(function(worker) {
    if (worker) {
        worker[0].destroy().then(function() {
        console.log('Managed to delete... yippiee');
        res.redirect('/');
      }, function(error) {
        // Show the error message and let the user try again
        console.error('FAIL! wah wah wah...');
        console.error('error message' + error);
        res.render('signup', {flash: error.message});
      });
    } else {
      res.send('specified worker does not exist')
    }
  },
  function() {
    res.send(500, 'Failed finding worker to delete');
  });
 
};