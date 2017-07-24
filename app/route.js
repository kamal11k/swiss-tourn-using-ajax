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

    app.get('/signup', function(req, res) {
        res.render('signup')
    });

    app.get('/logIn', function(req, res) {
        res.render('index')
    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', { failureFlash : true }, function(err, user, info) {
            if (err) {
                 res.status(500).send(JSON.stringify({
                    'msg': "Internal Server Error"
                }));
            }
            if (!user) {
                return res.render('index', { message: req.flash('loginMessage') });
            }
            req.login(user, function(err) {
                if (err) return next(err);
                req.session.save(function(err) {
                    if (!err) {
                        return res.redirect('/viewTournament');
                    }
                    else {
                        console.log('error occured during session save');
                    }
                });
            });
        })(req, res, next);
    });

    app.post('/signup', function(req, res, next) {
        passport.authenticate('local-signup', { failureFlash : true }, function(err, user, info) {
            if (err) {
                 res.status(500).send(JSON.stringify({
                    'msg': "Internal Server Error"
                }));
            }
            if (!user) {
               return res.render('signup', { message: req.flash('signupMessage') });
            }
            req.login(user, function(err) {
                if (err) return next(err);
                req.session.save(function(err) {
                    if (!err) {
                        return res.render('index', { msg: req.flash('signupMessage') });
                    }
                    else {
                        console.log('error occured during session save');
                    }
                });
            });
        })(req, res, next);
    });

    app.get('/auth/google', passport.authenticate('google',
        {
            scope : 'email'
        }
    ));

    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/viewTournament',
            failureRedirect : '/'
        }
    ));

    app.get('/auth/facebook', passport.authenticate('facebook',
        {
            scope : 'email'
        }
    ));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/viewTournament',
            failureRedirect : '/'
        }
    ));

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
                    res.json({"msg":"Player cann't be added once match starts"});
                }
                else {
                    swiss.registerNewPlayer(user_id,tournament_id,player_name,function(error,x){
                        if(error){
                            res.json({"msg":"Player already exists"})
                        }
                        else{
                            res.json({"data":x,"msg":false});
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
                    res.json({"msg":"Player cann't be added once match starts"})
                }
                else {
                    swiss.registerExistingPlayer(user_id,tournament_id,player_name,function(error,x){
                        if(error){
                            res.json({"msg":"Error in adding player"});
                        }
                        else{
                            res.json({"data":x,"msg":false});
                        }
                    })
                }
            }
        })
    })

    app.get('/canStartMatch/:t_id',function(req,res,next){
        var t_id = req.params.t_id;
        swiss.countPlayers(t_id,function(error,count){
            if(error){
                res.json({"msg":"Error in counting player"});
            }
            else {
                if(!(Math.log2(count)%1==0) || count==1){
                    res.json({"msg":'No. of players should be power of 2.  example- 2, 4, 8, 16 etc'});
                }
                else {
                    res.json({"msg":false})
                }
            }
        })
    })

    app.post('/createTournament',isLoggedIn,function(req,res,next){
        var user_id = req.session.passport.user;
        var t_name = req.body.t_name;
        swiss.createTournament(user_id,t_name,function(error,x){
            if(error)
                res.json({"msg":"Tournament alredy exists"})
            else {
                res.json({data:x,"msg":false});
            }
        })
    })

    app.post('/setWinner',isLoggedIn,function(req,res,next){
        var t_id = req.body.t_id;
        var winner = req.body.winner;
        swiss.setWinner(t_id,winner,function(error,x){
            if(error)
                res.json({"msg":"Error in inserting winner"});
            else {
                res.json({data:x,msg:false});
            }
        })
    })

    app.get('/hasTournaments',isLoggedIn,function(req,res,next){
        var user_id = req.session.passport.user;
        swiss.hasTournaments(user_id,function(error,count){
            if(count==0)
                res.json({"msg":false});
            else{
                res.json({"msg":true});
            }
        })
    })

    app.get('/viewTournament',isLoggedIn,function(req,res,next){
        var user_id = req.session.passport.user;
        swiss.viewTournament(user_id,function(error,tournaments){
            if(error)
                res.json({"msg":"Error in adding player"});
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
                res.json({"msg":"Error in counting player"});
            else{
                swiss.getMaxRound(tournament_id,function(error,max_round){
                    if(error){
                        res.json({"msg":"Error in getting max_round"});
                    }
                    else{
                        res.json({
                            "count":count,
                            "max_round":max_round,
                            "msg":false
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
                res.json({"msg":"No players present"});
            else{
                swiss.existingPlayers(user_id,tournament_id,function(error,results){
                    if(error){
                        res.json({"msg":"Error in showing player"});
                    }
                    else{
                        swiss.playerStandings(tournament_id,function(error,result){
                            if(error)
                                res.json({"msg":"Error in getting playerstanding"});
                            else{
                                swiss.getTournament(tournament_id,function(error,tour){
                                    //res.json(data);
                                    res.render('tournament.hbs',{
                                                                "tournament":tour,
                                                                "players":data,
                                                                "ex_players":results,
                                                                "standing":result
                                                                }
                                    )
                                })
                            }
                        })
                    }
                })
            }
        })
    })


    app.post('/reportMatch',isLoggedIn,function(req,res,result){
        var t_id = req.body.t_id;
        var roundInfo = req.body.roundDetails;
        roundInfo.forEach(function(match){
            swiss.reportMatch(t_id,match.round,match.winner_id,match.loser_id,function(error,results){
            })
        })
        swiss.countPlayers(t_id,function(err,count){
            if(err){
                res.json({"msg":"error in counting player"})
            }
            else {
                swiss.setStatus(t_id,count,roundInfo[0].round,function(error,status){
                    if(error){
                        res.json({"msg":"error in setting tournament status"})
                    }
                    else{
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
            if(error){
                res.json({"msg":"error in counting player"})
            }
            else {
                if(!(Math.log2(count)%1==0) || count==1){
                    res.json({"msg":'No. of players should be power of 2.  example- 2, 4, 8, 16 etc'});
                }
                else {
                    swiss.getMaxRound(tournament_id,function(error,max_round){
                        if(error){
                            res.json({"msg":"error in getting max round"})
                        }
                        else{
                            swiss.getRoundStatus(tournament_id,count,function(error,status){
                                res.json({
                                        "count":count,
                                        "status":status,
                                        "max_round":max_round,
                                        "msg":false
                                    }
                                )
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
                res.json({"msg":"error in showing standing"})
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
                res.json({"msg":"error in getting fixture"})
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
                res.json({"msg":"error in getting round result"})
            }
            else{
                res.json({"data":result})
            }
        })
    })

    app.get('/logout', function(req,res){
        req.session.destroy(function (err) {
        res.render('index');
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
