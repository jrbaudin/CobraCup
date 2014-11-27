var _ = require('underscore');

exports.showLeague = function(req, res) {
  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.descending('points');
  standingsQuery.include(["team.nhlTeam"]);
  standingsQuery.find().then(function(standings) {
    if (standings) {
      console.log("Gotten the standings...");
      res.render('league', {
        standings: standings
      });
    } else {
      console.error('Problem when trying to get team standings, could not get any');
      res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
    }
  },
  function(error){
    console.error('Error when trying to get team standings');
    console.error(error);
    res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
  });
};

exports.showDivisions = function(req, res) {
  var Standings = Parse.Object.extend('Standings');
  var standingsQuery = new Parse.Query(Standings);
  standingsQuery.descending('points');
  standingsQuery.include(["team.nhlTeam"]);
  standingsQuery.find().then(function(standings) {
    if (standings) {
      console.log("Gotten the standings...");
      res.render('divisions', {
        standings: standings
      });
    } else {
      console.error('Problem when trying to get team standings, could not get any');
      res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
    }
  },
  function(error){
    console.error('Error when trying to get team standings');
    console.error(error);
    res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
  });
};

exports.showPlayerStats = function(req, res) {
  var PlayerStats = Parse.Object.extend('PlayerStats');
  var playerStatGoalQuery = new Parse.Query(PlayerStats);
  playerStatGoalQuery.descending('player_goals');
  playerStatGoalQuery.include("player_team.nhlTeam");
  playerStatGoalQuery.find().then(function(playerGoalStats) {
    if (playerGoalStats) {
      console.log("Gotten the playerGoalStats...");
      //console.log("playerStats: " + JSON.stringify(playerStats));
      var playerStatFightQuery = new Parse.Query(PlayerStats);
      playerStatFightQuery.descending('player_fights');
      playerStatFightQuery.include("player_team.nhlTeam");
      playerStatFightQuery.find().then(function(playerFightStats) {
        if (playerFightStats) {
          console.log("Gotten the playerFightStats...");
          //console.log("playerStats: " + JSON.stringify(playerStats));
          res.render('playerstats', {
            playerGoals: playerGoalStats,
            playerFights: playerFightStats
          });
        } else {
          console.error('Problem when trying to get player stats, could not get any');
          res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
        }
      },
      function(error){
        console.error('Error when trying to get player stats');
        console.error(error);
        res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
      });

    } else {
      console.error('Problem when trying to get player stats, could not get any');
      res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
    }
  },
  function(error){
    console.error('Error when trying to get player stats');
    console.error(error);
    res.render('hub', {flashError: 'Problem när den önskade tabellen skulle hämtas'});
  });
};

exports.loadMatchReporter = function(req, res) {
  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  gameQuery.equalTo('game_id', req.params.gameid);
  gameQuery.include('result');
  gameQuery.find().then(function(game) {
    if (game) {
      console.log("Gotten the game...");
      var Team = Parse.Object.extend('Team');
      var allTeamsQuery = new Parse.Query(Team);
      allTeamsQuery.descending('team_name');
      allTeamsQuery.include('nhlTeam');
      allTeamsQuery.find().then(function(teams) {
        if (teams) {
          res.render('reporter', {
            game: game,
            teams: teams
          });
        } else {
          res.render('reporter', {
            flashError: "Kunde inte ladda match. Försök igen"
          });
        }
      },
      function(error) {
        console.error('Error when trying to get all teams');
        console.error(error);
        res.render('reporter', {
          flashError: "Kunde inte ladda match. Försök igen"
        });
      });
    } else {
      res.render('reporter', {
        flashError: "Kunde inte ladda match. Försök igen"
      });
    }
  },
  function(error){
    console.error('Error when trying to find game to report');
    console.error(error);
    res.render('reporter', {flashError: 'Problem när den önskade matchen skulle hämtas'});
  });
};

exports.saveMatchResult = function(req, res) {
  //console.log("Starting to save the result...");

  var result_already_submitted = false;

  var home_goals = req.body.home_goals;
  var away_goals = req.body.away_goals;

  var home_points = 0;
  var away_points = 0;

  if(home_goals > away_goals){
    home_points = home_points+3;
  } else if (away_goals > home_goals) {
    away_points = away_points+3;
  } else {
    home_points = home_points+1;
    away_points = away_points+1;
  }
  
  var home_captain_id = req.body.home_captain_id;
  var home_lieutenant_id = req.body.home_lieutenant_id;
  var away_captain_id = req.body.away_captain_id;
  var away_lieutenant_id = req.body.away_lieutenant_id;

  console.log("home_captain_id: " + home_captain_id + " home_lieutenant_id: " + home_lieutenant_id + " away_captain_id: " + away_captain_id + " away_lieutenant_id: " + away_lieutenant_id);
  
  var home_captain_goals = parseInt(req.body.home_captain_goals);
  var home_captain_fights = parseInt(req.body.home_captain_fights);
  var home_lieutenant_goals = req.body.home_lieutenant_goals;
  var home_lieutenant_fights = req.body.home_lieutenant_fights;
  var away_captain_goals = req.body.away_captain_goals;
  var away_captain_fights = req.body.away_captain_fights;
  var away_lieutenant_goals = req.body.away_lieutenant_goals;
  var away_lieutenant_fights = req.body.away_lieutenant_fights;

  var Game = Parse.Object.extend('Game');
  var gameQuery = new Parse.Query(Game);
  gameQuery.equalTo('game_id', req.params.gameid);
  gameQuery.include('result');
  gameQuery.find().then(function(game) {
    if (game) {
      result_already_submitted = game[0].get("result_submitted");
      //console.log("Found the game to save...");
      var GameResult = Parse.Object.extend('GameResult');
      var gameResultQuery = new Parse.Query(GameResult);
      gameResultQuery.equalTo('game_id', game[0].get("game_id"));
      gameResultQuery.find().then(function(gResult) {
        if (gResult) {
          var home_goals_old = gResult[0].get("home_goals");
          var away_goals_old = gResult[0].get("away_goals");

          var home_captain_goals_old = gResult[0].get("home_captain_goals");
          var home_captain_fights_old = gResult[0].get("home_captain_fights");
          var home_lieutenant_goals_old = gResult[0].get("home_lieutenant_goals");
          var home_lieutenant_fights_old = gResult[0].get("home_lieutenant_fights");
          var away_captain_goals_old = gResult[0].get("away_captain_goals");
          var away_captain_fights_old = gResult[0].get("away_captain_fights");
          var away_lieutenant_goals_old = gResult[0].get("away_lieutenant_goals");
          var away_lieutenant_fights_old = gResult[0].get("away_lieutenant_fights");

          //console.log("Found the game result to save...");
          gResult[0].set('home_goals', parseInt(home_goals));
          gResult[0].set('away_goals', parseInt(away_goals));
          gResult[0].set('home_captain_goals', parseInt(home_captain_goals));
          gResult[0].set('home_captain_fights', parseInt(home_captain_fights));
          gResult[0].set('home_lieutenant_goals', parseInt(home_lieutenant_goals));
          gResult[0].set('home_lieutenant_fights', parseInt(home_lieutenant_fights));
          gResult[0].set('away_captain_goals', parseInt(away_captain_goals));
          gResult[0].set('away_captain_fights', parseInt(away_captain_fights));
          gResult[0].set('away_lieutenant_goals', parseInt(away_lieutenant_goals));
          gResult[0].set('away_lieutenant_fights', parseInt(away_lieutenant_fights));

          gResult[0].save().then(function(gResSaved) {
            //console.log("Managed to save the result...");
            game[0].set('result_submitted', true);
            game[0].set('played', true);
            game[0].save().then(function(savedGame) {
              //console.log("Managed to save the game...");
              var Team = Parse.Object.extend('Team');

              var innerHomeTeamQuery = new Parse.Query(Team);
              innerHomeTeamQuery.equalTo('objectId', game[0].get("home").id);

              var innerAwayTeamQuery = new Parse.Query(Team);
              innerAwayTeamQuery.equalTo('objectId', game[0].get("away").id);

              var Standings = Parse.Object.extend('Standings');

              if(result_already_submitted){
                console.log("Result already been submitted before, need to fix this...");

                var home_points_for_update = 0;
                var away_points_for_update = 0;

                if(home_goals_old > away_goals_old){
                  home_points_for_update = home_points_for_update+2;
                } else if (away_goals_old > home_goals_old) {
                  away_points_for_update = away_points_for_update+2;
                } else {
                  home_points_for_update = home_points_for_update+1;
                  away_points_for_update = away_points_for_update+1;
                }

                var standingsQuery = new Parse.Query(Standings);
                standingsQuery.matchesQuery('team', innerHomeTeamQuery);
                standingsQuery.find().then(function(standingHomeTeam) {
                  if (standingHomeTeam) {
                    //console.log("Found the home team standing to update...");
                    var h_points_current = standingHomeTeam[0].get("points")-home_points_for_update;
                    standingHomeTeam[0].set('points', h_points_current+home_points);
                    standingHomeTeam[0].save().then(function(gStandingSaved) {
                      //console.log("Managed to save the result...");

                      var standingsAwayQuery = new Parse.Query(Standings);
                      standingsAwayQuery.matchesQuery('team', innerAwayTeamQuery);
                      standingsAwayQuery.find().then(function(standingAwayTeam) {
                        if (standingAwayTeam) {
                          //onsole.log("Found the away team standing to update...");
                          var a_points_current = standingAwayTeam[0].get("points")-away_points_for_update;
                          standingAwayTeam[0].set('points', a_points_current+away_points);
                          standingAwayTeam[0].save().then(function(gStandingAwaySaved) {
                            //console.log("Managed to save the result...");

                            var PlayerStats = Parse.Object.extend('PlayerStats');

                            //Save home captain player stats (goals and fights)
                            var HomeCapQuery = new Parse.Query(PlayerStats);
                            HomeCapQuery.equalTo('player_id', home_captain_id);
                            HomeCapQuery.find().then(function(homeCap) {
                              if (homeCap) {
                                console.log("Found the home captain...");
                                var home_cap_goals_current = homeCap[0].get("player_goals")-home_captain_goals_old;
                                var home_cap_fights_current = homeCap[0].get("player_fights")-home_captain_fights_old;
                                homeCap[0].set('player_goals', home_cap_goals_current+home_captain_goals);
                                homeCap[0].set('player_fights', home_cap_fights_current+home_captain_fights);
                                homeCap[0].save().then(function(homeCapSaved) {
                                  console.log("Managed to update the home captain stats...");
                                }, function(error) {
                                  console.error('Error when trying to update home captain player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update home captain player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update home captain player stats');
                              console.error(error);
                            });
                            
                            //Save home lieutenant player stats (goals and fights)
                            var HomeLieuQuery = new Parse.Query(PlayerStats);
                            HomeLieuQuery.equalTo('player_id', home_lieutenant_id);
                            HomeLieuQuery.find().then(function(homeLieu) {
                              if (homeLieu) {
                                console.log("Found the home lieutenant...");
                                var home_lieu_goals_current = homeLieu[0].get("player_goals")-home_lieutenant_goals_old;
                                var home_lieu_fights_current = homeLieu[0].get("player_fights")-home_lieutenant_fights_old;
                                homeLieu[0].set('player_goals', home_lieu_goals_current+home_lieutenant_goals);
                                homeLieu[0].set('player_fights', home_lieu_fights_current+home_lieutenant_fights);
                                homeLieu[0].save().then(function(homeLieuSaved) {
                                  console.log("Managed to update the home lieutenant stats...");
                                }, function(error) {
                                  console.error('Error when trying to update home lieutenant player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update home lieutenant player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update home lieutenant player stats');standingsQuery
                              console.error(error);
                            });
                            
                            //Save away captain player stats (goals and fights)
                            var awayCapQuery = new Parse.Query(PlayerStats);
                            awayCapQuery.equalTo('player_id', away_captain_id);
                            awayCapQuery.find().then(function(awayCap) {
                              if (awayCap) {
                                console.log("Found the away captain...");
                                var away_cap_goals_current = awayCap[0].get("player_goals")-away_captain_goals_old;
                                var away_cap_fights_current = awayCap[0].get("player_fights")-away_captain_fights_old;
                                awayCap[0].set('player_goals', away_cap_goals_current+away_captain_goals);
                                awayCap[0].set('player_fights', away_cap_fights_current+away_captain_fights);
                                awayCap[0].save().then(function(awayCapSaved) {
                                  console.log("Managed to update the away captain stats...");
                                }, function(error) {
                                  console.error('Error when trying to update away captain player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update away captain player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update away captain player stats');
                              console.error(error);
                            });
                            
                            //Save away lieutenant player stats (goals and fights)
                            var awayLieuQuery = new Parse.Query(PlayerStats);
                            awayLieuQuery.equalTo('player_id', away_lieutenant_id);
                            awayLieuQuery.find().then(function(awayLieu) {
                              if (awayLieu) {
                                console.log("Found the away lieutenant...");
                                var away_lieu_goals_current = awayLieu[0].get("player_goals")-away_lieutenant_goals_old;
                                var away_lieu_fights_current = awayLieu[0].get("player_fights")-away_lieutenant_fights_old;
                                awayLieu[0].set('player_goals', away_lieu_goals_current+away_lieutenant_goals);
                                awayLieu[0].set('player_fights', away_lieu_fights_current+away_lieutenant_fights);
                                awayLieu[0].save().then(function(awayLieuSaved) {
                                  console.log("Managed to update the away captain stats...");
                                }, function(error) {
                                  console.error('Error when trying to update away captain player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update away captain player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update away captain player stats');
                              console.error(error);
                            });

                            var string = encodeURIComponent('Matchresultat updaterat med lyckat resultat!');
                            res.redirect('/?info=' + string);

                          }, function(error) {
                            console.error('Error when trying to update game result');
                            console.error(error);
                            var string = encodeURIComponent('Matchresultat kunde inte updateras! err-id: G14');
                            res.redirect('/?error=' + string);
                          });
                        } else {
                          var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: 15');
                          res.redirect('/?error=' + string);
                        }
                      },
                      function(error){
                        console.error('Error when trying to find game result to save');
                        console.error(error);
                        var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G16');
                        res.redirect('/?error=' + string);
                      });

                    }, function(error) {
                      console.error('Error when trying to save game result');
                      console.error(error);
                      var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G17');
                      res.redirect('/?error=' + string);
                    });
                  } else {
                    var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G18');
                    res.redirect('/?error=' + string);
                  }
                },
                function(error){
                  console.error('Error when trying to find game result to save');
                  console.error(error);
                  var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G19');
                  res.redirect('/?error=' + string);
                });

              } else {
                var standingsQuery = new Parse.Query(Standings);
                standingsQuery.matchesQuery('team', innerHomeTeamQuery);
                standingsQuery.find().then(function(standingHomeTeam) {
                  if (standingHomeTeam) {
                    //console.log("Found the home team standing to save...");
                    var h_points_current = standingHomeTeam[0].get("points");

                    var h_goals_for_current = standingHomeTeam[0].get("goals_for");
                    var h_goals_against_current = standingHomeTeam[0].get("goals_against");
                    var h_wins_current = standingHomeTeam[0].get("wins");
                    var h_losses_current = standingHomeTeam[0].get("losses");
                    var h_games_played_current = standingHomeTeam[0].get("games_played");

                    standingHomeTeam[0].set('points', h_points_current+home_points);
                    standingHomeTeam[0].set('points', h_points_current+home_points);
                    standingHomeTeam[0].save().then(function(gStandingSaved) {
                      //console.log("Managed to save the result...");

                      var standingsAwayQuery = new Parse.Query(Standings);
                      standingsAwayQuery.matchesQuery('team', innerAwayTeamQuery);
                      standingsAwayQuery.find().then(function(standingAwayTeam) {
                        if (standingAwayTeam) {
                          //console.log("Found the home team standing to save...");
                          var a_points_current = standingAwayTeam[0].get("points");
                          standingAwayTeam[0].set('points', a_points_current+away_points);
                          standingAwayTeam[0].save().then(function(gStandingAwaySaved) {
                            console.log("Managed to save the result... trying to save player stats");
                            
                            var PlayerStats = Parse.Object.extend('PlayerStats');

                            //Save home captain player stats (goals and fights)
                            var HomeCapQuery = new Parse.Query(PlayerStats);
                            HomeCapQuery.equalTo('player_id', home_captain_id);
                            HomeCapQuery.find().then(function(homeCap) {
                              if (homeCap) {
                                console.log("Found the home captain...");
                                var home_cap_goals_current = parseInt(homeCap[0].get("player_goals"));
                                var home_cap_fights_current = parseInt(homeCap[0].get("player_fights"));
                                homeCap[0].set('player_goals', (home_cap_goals_current+home_captain_goals)).toString();
                                homeCap[0].set('player_fights', (home_cap_fights_current+home_captain_fights)).toString();
                                homeCap[0].save().then(function(homeCapSaved) {
                                  console.log("Managed to update the home captain stats...");
                                }, function(error) {
                                  console.error('Error when trying to update home captain player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update home captain player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update home captain player stats');
                              console.error(error);
                            });
                            
                            //Save home lieutenant player stats (goals and fights)
                            var HomeLieuQuery = new Parse.Query(PlayerStats);
                            HomeLieuQuery.equalTo('player_id', home_lieutenant_id);
                            HomeLieuQuery.find().then(function(homeLieu) {
                              if (homeLieu) {
                                console.log("Found the home lieutenant...");
                                var home_lieu_goals_current = homeLieu[0].get("player_goals");
                                var home_lieu_fights_current = homeLieu[0].get("player_fights");
                                homeLieu[0].set('player_goals', (home_lieu_goals_current+home_lieutenant_goals)).toString();
                                homeLieu[0].set('player_fights', (home_lieu_fights_current+home_lieutenant_fights)).toString();
                                homeLieu[0].save().then(function(homeLieuSaved) {
                                  console.log("Managed to update the home lieutenant stats...");
                                }, function(error) {
                                  console.error('Error when trying to update home lieutenant player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update home lieutenant player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update home lieutenant player stats');
                              console.error(error);
                            });
                            
                            //Save away captain player stats (goals and fights)
                            var awayCapQuery = new Parse.Query(PlayerStats);
                            awayCapQuery.equalTo('player_id', away_captain_id);
                            awayCapQuery.find().then(function(awayCap) {
                              if (awayCap) {
                                console.log("Found the away captain...");
                                var away_cap_goals_current = awayCap[0].get("player_goals");
                                var away_cap_fights_current = awayCap[0].get("player_fights");
                                awayCap[0].set('player_goals', (away_cap_goals_current+away_captain_goals)).toString();
                                awayCap[0].set('player_fights', (away_cap_fights_current+away_captain_fights)).toString();
                                awayCap[0].save().then(function(awayCapSaved) {
                                  console.log("Managed to update the away captain stats...");
                                }, function(error) {
                                  console.error('Error when trying to update away captain player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update away captain player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update away captain player stats');
                              console.error(error);
                            });
                            
                            //Save away lieutenant player stats (goals and fights)
                            var awayLieuQuery = new Parse.Query(PlayerStats);
                            awayLieuQuery.equalTo('player_id', away_lieutenant_id);
                            awayLieuQuery.find().then(function(awayLieu) {
                              if (awayLieu) {
                                console.log("Found the away lieutenant...");
                                var away_lieu_goals_current = awayLieu[0].get("player_goals");
                                var away_lieu_fights_current = awayLieu[0].get("player_fights");
                                awayLieu[0].set('player_goals', (away_lieu_goals_current+away_lieutenant_goals)).toString();
                                awayLieu[0].set('player_fights', (away_lieu_fights_current+away_lieutenant_fights)).toString();
                                awayLieu[0].save().then(function(awayLieuSaved) {
                                  console.log("Managed to update the away captain stats...");
                                }, function(error) {
                                  console.error('Error when trying to update away captain player stat');
                                  console.error(error);
                                });
                              } else {
                                console.error('Error when trying to update away captain player stat');
                              }
                            },
                            function(error){
                              console.error('Error when trying to update away captain player stats');
                              console.error(error);
                            });

                            var string = encodeURIComponent('Matchresultat sparat med lyckat resultat!');
                            res.redirect('/?info=' + string);

                          }, function(error) {
                            console.error('Error when trying to save game result');
                            console.error(error);
                            var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G8');
                            res.redirect('/?error=' + string);
                          });
                        } else {
                          var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G9');
                          res.redirect('/?error=' + string);
                        }
                      },
                      function(error){
                        console.error('Error when trying to find game result to save');
                        console.error(error);
                        var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G10');
                        res.redirect('/?error=' + string);
                      });

                    }, function(error) {
                      console.error('Error when trying to save game result');
                      console.error(error);
                      var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G11');
                      res.redirect('/?error=' + string);
                    });
                  } else {
                    var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G12');
                    res.redirect('/?error=' + string);
                  }
                },
                function(error){
                  console.error('Error when trying to find game result to save');
                  console.error(error);
                  var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G13');
                  res.redirect('/?error=' + string);
                });
              }
            }, function(error) {
              console.error('Error when trying to save game');
              console.error(error);
              var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G1');
              res.redirect('/?error=' + string);
            });
          }, function(error) {
            console.error('Error when trying to save game result');
            console.error(error);
            var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G2');
            res.redirect('/?error=' + string);
          });
        } else {
          var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G3');
          res.redirect('/?error=' + string);
        }
      },
      function(error){
        console.error('Error when trying to find game result to save');
        console.error(error);
        var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G4');
        res.redirect('/?error=' + string);
      });
    } else {
      var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G5');
      res.redirect('/?error=' + string);
    }
  },
  function(error){
    console.error('Error when trying to find game to report');
    console.error(error);
    var string = encodeURIComponent('Matchresultat kunde inte sparas! err-id: G6');
    res.redirect('/?error=' + string);
  });
};