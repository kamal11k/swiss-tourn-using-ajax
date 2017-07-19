var mysql = require('mysql');
var path = require('path');

var swiss = require ('./../lib/swisstourney.js');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
module.exports = function(app,passport) {

    app.get('/', function(req, res) {
        res.render('index');
    });


    app.get('/logIn', function(req, res) {
        res.render('logIn')
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/viewTournament',
        failureRedirect : '/',
        failureFlash : true
    }));


    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/logIn',
        failureRedirect : '/',
        failureFlash : true
    }));

    app.post('/addnewPlayer',isLoggedIn,function(req,res,next){
      var tournament_id = req.body.t_id;
      var player_name = req.body.p_name;
      var user_id = req.session.passport.user;

      swiss.isMatchStarted(tournament_id,function(error,isStarted){
          if(error){
              res.end('error')
          }
          else {
              if (isStarted != 0){
                  res.json({"msg":true});
              }
              else {
                  swiss.registerNewPlayer(user_id,tournament_id,player_name,function(error,x){
                      if(error){
                          res.json({"msg":true})
                      }
                      else{
                          //res.end('Player registered successfully!!');
                          res.json({"data":x});
                      }
                  })
              }
          }
      })
    })

    app.post('/addExistingPlayer',isLoggedIn,function(req,res,next){
        var tournament_id = req.body.t_id;
        var player_name = req.body.p_name;
        var user_id = req.session.passport.user;
        swiss.isMatchStarted(tournament_id,function(error,isStarted){
            if(error){
                res.end('error')
            }
            else {
                if (isStarted != 0){
                    console.log("ha ha ha ha ha ha ")
                    res.json({"msg":true})
                }
                else {
                    swiss.registerExistingPlayer(user_id,tournament_id,player_name,function(error,x){
                        if(error){
                            res.end('Registration failure');
                        }
                        else{
                            //res.end('Player registered successfully!!');
                            res.json({"data":x});
                        }
                    })
                }
            }
        })
    })

    app.get('/count',function(req,res,next){
        swiss.countPlayers(function(error,x){
            if(error)
                res.end('Error occured');
            else
                res.end('No. of player(s): '+x);
        })
    })

    // app.post('/register',function(req,res,next){
    //     req.body.hash = bcrypt.hashSync(req.body.pswd, saltRounds)
    //     swiss.registerUser(req.body,function(error,x){
    //         if(error)
    //             res.end('Registration failure');
    //         else
    //             res.sendFile(path.join(__dirname + '/views/RelogIn.html'));
    //     })
    // })

    app.post('/createTournament',isLoggedIn,function(req,res,next){
        var user_id = req.session.passport.user;
        var t_name = req.body.t_name;
        console.log(user_id,t_name);
        swiss.createTournament(user_id,t_name,function(error,x){
            if(error)
                res.end('Unsuccessfull');
            else {
                res.json({data:x});
            }
        })
    })

    app.post('/setWinner',isLoggedIn,function(req,res,next){
        var t_id = req.body.t_id;
        var winner = req.body.winner;
        swiss.setWinner(t_id,winner,function(error,x){
            if(error)
                res.end('Unsuccessfull');
            else {
                res.json({data:x});
            }
        })
    })

    app.get('/viewTournament',isLoggedIn,function(req,res,next){
        console.log("hello");
        var user_id = req.session.passport.user;
        console.log(user_id)
        swiss.viewTournament(user_id,function(error,tournaments){
            if(error)
                res.end('Unsuccessfull');
            else{
                res.render('createTournament.hbs',{
                    "data":tournaments
                });
            }
        })
    })

    app.get('/infoForDisable/:t_id',isLoggedIn,function(req,res,next){
        var tournament_id = req.params.t_id;
        swiss.countPlayers(tournament_id,function(error,count){
            if(error)
                res.end('Error occured');
            else{
                swiss.getMaxRound(tournament_id,function(error,max_round){
                    if(error){

                    }
                    else{
                        console.log(count,max_round)
                        res.json({
                            "count":count,
                            "max_round":max_round
                        })
                    }
                })
            }
        })

    })

    app.get('/individualTournament/:t_id',isLoggedIn,function(req,res,next){
        tournament_id = req.params.t_id;
        var user_id = req.session.passport.user;
        swiss.seePlayers(tournament_id,function(error,data){
            if(error)
                res.end('No players present');
            else{
                swiss.existingPlayers(user_id,tournament_id,function(error,results){
                    if(error){
                        res.end('error')
                    }
                    else{
                        swiss.playerStandings(tournament_id,function(error,result){
                            if(error)
                                res.end('Error');
                            else{
                                swiss.getTournament(tournament_id,function(error,tour){
                                    //res.json(data);
                                    res.render('tournament.hbs',{
                                                                "tournament":tour,
                                                                "players":data,
                                                                "ex_players":results,
                                                                "standing":result
                                                                })
                                })
                            }

                        })
                    }
                })
            }

        })
        //res.render('tournamentMenu.ejs',{"t_id":tournament_id})
    })


    app.post('/reportMatch',isLoggedIn,function(req,res,result){
        var t_id = req.body.t_id;
        var roundInfo = req.body.roundDetails;
        roundInfo.forEach(function(match){
            swiss.reportMatch(t_id,match.round,match.winner_id,match.loser_id,function(error,res){
                if(error){
                    // res.json({"msg":"error"})
                }
                else {

                }
            })
        })
        swiss.countPlayers(t_id,function(err,count){
            if(err){

            }
            else {
                swiss.setStatus(t_id,count,roundInfo[0].round,function(error,status){
                    if(error){

                    }
                    else{
                        console.log(status);
                        res.json({
                            "count":count,
                            "round":roundInfo[0].round,
                            "status":status
                        })
                    }
                })
            }
        })

    })

    app.get('/Start/:t_id',isLoggedIn,function(req,res,next){
        var tournament_id = req.params.t_id;
        swiss.countPlayers(tournament_id,function(error,count){
          console.log(count,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab");
            if(error){
                console.log('he he !! error')
            }
            else {
                console.log(count,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab");
                if(!(Math.log2(count)%1==0) || count==1){
                    console.log(count,"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                    res.json({"msg":'No. of players should be power of 2.  example- 2, 4, 8, 16 etc'});
                }
                else {
                    swiss.getMaxRound(tournament_id,function(error,max_round){
                        if(error){

                        }
                        else{
                            swiss.getRoundStatus(tournament_id,count,function(error,status){
                                res.json({  "count":count,
                                            "status":status,
                                            "max_round":max_round,
                                            "msg":false
                                          })
                            })
                        }
                    })
                }
            }
        })
    });

    app.get('/showStanding/:t_id',isLoggedIn,function(req,res,next){
        var tournament_id = req.params.t_id;
        swiss.playerStandings(tournament_id,function(error,data){
            if(error)
                res.end('Error');
            else{
                res.json(data);
            }

        })
    });

    app.get('/getFixture/:info',isLoggedIn,function(req,res,next){
        var round = req.params.info.split('.')[0];
        var tournament_id = req.params.info.split('.')[1];
        swiss.swissPairings(tournament_id,function(error,data){
            if(error)
                res.end('Error');
            else{
                res.json({"pairs":data});
            }

        })
    });

    app.get('/getroundResult/:info',isLoggedIn,function(req,res,next){
        var round = req.params.info.split('.')[0];
        var tournament_id = req.params.info.split('.')[1];
        swiss.getroundResult(tournament_id,round,function(err,result){
            if(err){

            }
            else{
                res.json({"data":result})
            }
        })
    })



    // function isLoggedIn(req, res, next){
    //     if(req.session.passport.user){
    //         next();     //If session exists, proceed to page
    //     }
    //     else {
    //         res.status(404).send('You are not allowed to access')
    //     }
    // }

    app.get('/logout', function(req,res){
        req.session.destroy(function (err) {
        console.log("COOKIE DELETED");
        res.render('logIn');
        });
    });


}
  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    else {
      res.redirect('/');
    }
  }
