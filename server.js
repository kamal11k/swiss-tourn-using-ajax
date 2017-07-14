var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var swiss = require ('./lib/swisstourney.js');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var host = 'localhost';
    port = 8000;

var app = express();
var handlebars = require('express-handlebars')
                .create({
                    extname  : '.hbs'
                });

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.use(morgan('dev'));
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser('12345-54321-67890-09876'));//secret key
app.use(session({   secret: 'winter is coming' ,
                    resave:'false',
                    saveUninitialized :'true',
                    cookie : 'maxAge: 1000*60*2'
                })
        );


app.post('/addnewPlayer',checkSignIn,function(req,res,next){
    var tournament_id = req.session.t_id;
    var player_name = req.body.p_name;
    var user_id = req.session.user_id;
    console.log(tournament_id)
    swiss.isMatchStarted(tournament_id,function(error,isStarted){
        if(error){
            res.end('error')
        }
        else {
            if (typeof isStarted != 'undefined'){
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

app.post('/addExistingPlayer',checkSignIn,function(req,res,next){
    var tournament_id = req.session.t_id;
    var player_name = req.body.p_name;
    var user_id = req.session.user_id;
    swiss.isMatchStarted(tournament_id,function(error,isStarted){
        if(error){
            res.end('error')
        }
        else {
            if (typeof isStarted != 'undefined'){
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

app.delete('/delete',function(req,res,next){
    swiss.deletePlayers(function(error,x){
        if(error)
            res.end('Error occured');
        else
            res.end('deleted row(s) '+x);
    })
})

// app.delete('/delete/:id',function(req,res,next){
//     swiss.removePlayer(req.params.id,function(error,x){
//         if(error)
//             res.end('Error occured');
//         else
//             res.end('deleted row(s) '+x);
//     })
// })


app.post('/register',function(req,res,next){
    req.body.hash = bcrypt.hashSync(req.body.pswd, saltRounds)
    swiss.registerUser(req.body,function(error,x){
        if(error)
            res.end('Registration failure');
        else
            res.sendFile(path.join(__dirname + '/views/RelogIn.html'));
    })
})

app.post('/createTournament',checkSignIn,function(req,res,next){
    var user_id = req.session.user_id;
    var t_name = req.body.t_name;
    console.log(user_id,t_name);
    swiss.createTournament(user_id,t_name,function(error,x){
        if(error)
            res.end('Unsuccessfull');
        else {
            res.json({msg:"done"});
        }
    })
})

app.get('/viewTournament',checkSignIn,function(req,res,next){
    var user_id = req.session.user_id;
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

app.get('/individualTournament/:t_id',checkSignIn,function(req,res,next){
    req.session.t_id = req.params.t_id;
    tournament_id = req.session.t_id;
    var user_id = req.session.user_id;
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

app.post('/add_player',checkSignIn,function(req,res,next){
    var tournament_id = req.body.t_id;
    var user_id = req.session.user_id;
    swiss.isMatchStarted(tournament_id,function(error,isStarted){
        if(error){
            res.end('error')
        }
        else {
            console.log(isStarted);
            if (typeof isStarted != 'undefined'){
                res.end("Can't add player once the match has started");
            }
            else {
                swiss.existingPlayers(user_id,tournament_id,function(error,results){
                    if(error){
                        res.end('error')
                    }
                    else{
                        res.render('addPlayer.ejs',{"t_id":tournament_id,"data":results});
                    }
                })
            }
        }
    })

})

app.post('/logIn',function(req,res,next){
    var user_name = req.body.user_name;
    var pswd = req.body.pswd;
    swiss.checkUser(user_name,pswd,function(error,result){
        if(error)
            res.end('Error occured');
        else if(bcrypt.compareSync(pswd, result.password)){
            req.session.user_id = result.id;
            res.redirect('/viewTournament')
        }
        else
            res.sendFile(path.join(__dirname + '/views/relogIn.html'));
    })
})

app.post('/ExecuteRound',checkSignIn,function(req,res,next){
    var t_id = req.body.t_id;
    var round = req.body.round;
    console.log(round)
    swiss.countPlayers(t_id,function(error,count){
        if(error){
            res.end(error)
        }
        else {
            if(round > Math.log2(count)){
                res.end('Tournament finished.  See winner in PlayerStanding');
            }
            else {
                swiss.swissPairings(t_id,function(error, sp) {
                    var arr = [];
                    sp.forEach(function(pairing, index){
                        if (Math.random() > 0.5) {
                            swiss.reportMatch(t_id,round, pairing[0].id, pairing[1].id, function(){
                                if (index == sp.length - 1) {
                                    swiss.playerStandings(t_id,function(error, x) {
                                        if (error) {
                                            res.end('error');
                                        }
                                        else {
                                            //res.json(x);
                                        }
                                    });
                                }
                            });
                            arr.push(`${pairing[0].name} beats ${pairing[1].name}`);
                            //res.json(`${pairing[0].name} beats ${pairing[1].name}`);
                        }
                        else {
                            swiss.reportMatch(t_id, round, pairing[1].id, pairing[0].id, function(){
                                if (index == sp.length - 1) {
                                    swiss.playerStandings(t_id,function(error, x) {
                                        if (error) {
                                            res.end('error');
                                        }
                                        else {
                                            //res.json(x);
                                        }
                                    });
                                }
                            });
                            arr.push(`${pairing[1].name} beats ${pairing[0].name}`);
                            //res.json(`${pairing[1].name} beats ${pairing[0].name}`);
                        }
                    });
                    res.render('roundResults.ejs',{"data":arr,"t_id":t_id});
                });
            }
        }
    })
})

app.post('/reportMatch',checkSignIn,function(req,res,result){
    var t_id = req.session.t_id;
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
                        "status":status,
                        "t_id":t_id
                    })
                }
            })
        }
    })

})

app.get('/Start',checkSignIn,function(req,res,next){
    var tournament_id = req.session.t_id;
    swiss.countPlayers(tournament_id,function(error,count){
        if(error){
            res.end(error)
        }
        else {
            if(!(count&&(count & (count - 1)) === 0)){
                res.json({"msg":'No. of players should be power of 2.  example- 2, 4, 8, 16 etc'});
            }
            else {
                swiss.getMaxRound(tournament_id,function(error,max_round){
                    if(error){

                    }
                    else{
                        swiss.getRoundStatus(tournament_id,count,function(error,status){
                            res.json({  "count":count,
                                        "t_id":tournament_id,
                                        "status":status,
                                        "max_round":max_round,
                                        "msg":false})
                        })
                    }
                })
            }
        }
    })
});

app.get('/showStanding',checkSignIn,function(req,res,next){
    var tournament_id = req.session.t_id;
    swiss.playerStandings(tournament_id,function(error,data){
        if(error)
            res.end('Error');
        else{
            res.json(data);
        }

    })
});

app.get('/getFixture/:round',checkSignIn,function(req,res,next){
    var tournament_id = req.session.t_id;
    var round = req.params.round;
    swiss.swissPairings(tournament_id,function(error,data){
        if(error)
            res.end('Error');
        else{
            res.json({"pairs":data,"round":round});
        }

    })
});

app.get('/getroundResult/:round',checkSignIn,function(req,res,next){
    var round = req.params.round;
    var t_id = req.session.t_id;
    swiss.getroundResult(t_id,round,function(err,result){
        if(err){

        }
        else{
            res.json({"data":result})
        }
    })
})

app.post('/Players',checkSignIn,function(req,res,next){
    var tournament_id = req.body.t_id;
    swiss.seePlayers(tournament_id,function(error,data){
        if(error)
            res.end('No players present');
        else{
            //res.json(data);
            res.render('seePlayers.ejs',{'data':data})
        }

    })
});


app.get('/createTournament',checkSignIn,function(req,res,next){
    res.sendFile(path.join(__dirname + '/views/tournament.html'));
})
app.use('/',express.static(path.join(__dirname ,'/views')));
app.use(express.static(path.join(__dirname, 'public')));

function checkSignIn(req, res, next){
    if(req.session.user_id){
        next();     //If session exists, proceed to page
    }
    else {
        res.status(404).send('You are not allowed to access')
    }
}

app.get('/logout', function(req,res){
    req.session.destroy(function (err) {
    console.log("COOKIE DELETED");
    res.redirect('/');
    });
});

app.listen(port,host,function(){
    console.log('Server is running');
})
