var mysql = require('mysql');
var Game = require('./tournament_lib.js').Game;
var Tournament = require('./tournament_lib.js').Tournament;

/*
Adds a player to the tournament by putting an entry in the database.
The database should assign an ID number to the player. Different players may
have the same names but will receive different ID numbers.
*/
function get_connection() {
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'mountblue',
	  database : 'swiss_tournament'
	});
	connection.connect();
	return connection
}

function registerNewPlayer(user_id,t_id,name, cb) {
	var connection = get_connection();
	var query = 'select count(distinct name) as count from player where user_id=? and name=?';
	connection.query(query,[user_id,name],function(error,result){
		if(error){
			cb(error)
		}
		if(result[0].count>0){
			cb(true,0);
		}
		else {
			var query = 'insert into player(user_id,tournament_id,name) values(?,?,?)';
			connection.query(query, [user_id,t_id,name] ,function (error, results, fields) {
			//connection.end();
				if (error) {
					cb(error, 0);
				}
				else{
					var query =  `
						select distinct name from player where user_id=? and tournament_id not in (?) and
							 name not in(select name from player where tournament_id=?)
						`
					connection.query(query,[user_id,t_id,t_id], function(error,data){
						connection.end();
						if (error) {
							//console.log('nullnullnullnullnullnullnullnullnullnullnullnullnullnull')
							cb(error, 0);
						}
						cb(null, data);
					})
				}
			});
		}
	})
}

function registerExistingPlayer(user_id,t_id,name, cb) {
	var connection = get_connection();
	var query = 'select distinct id from player where name=? and user_id=?';
	connection.query(query,[name,user_id],function(error,player){
		if(error){
			cb(error)
		}
		else{
			var player_id = player[0].id;
			//console.log(player_id)
			var query = 'insert into player(id,user_id,tournament_id,name) values(?,?,?,?)';
			connection.query(query, [player_id,user_id,t_id,name] ,function (error, results, fields) {
				//connection.end();
				if (error) {
					cb(error, 0);
				}
				else{
					var query =  `
						select distinct name from player where user_id=? and tournament_id not in (?) and
									 name not in(select name from player where tournament_id=?)
						`
					connection.query(query,[user_id,t_id,t_id], function(error,data){
						connection.end();
						if (error) {
							//console.log('nullnullnullnullnullnullnullnullnullnullnullnullnullnull')
							cb(error, 0);
						}
						cb(null, data);
					})
				}
			});
		}
	})
}

function seePlayers(t_id, cb) {
	var connection = get_connection();
	var query = 'Select * from player where tournament_id=?';
	connection.query(query, t_id ,function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results);
	});
}
/*
Returns the number of currently registered players.

*/
function countPlayers(t_id,cb){
	var connection = get_connection();
	var query = 'select count(*) as total_num from player where tournament_id=?'
	connection.query(query, t_id, function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results[0].total_num);
	});
}

function existingPlayers(user_id,t_id,cb){
	var connection = get_connection();
	var query = `
			select distinct name from player where user_id=? and tournament_id not in (?) and
name not in(select name from player where tournament_id=?)
			`
	connection.query(query,[user_id,t_id,t_id], function(error,results){
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results);
	})
}

/*
Clear out all the player records from the database.
*/
function deletePlayers(cb) {
	var connection = get_connection();
	connection.query('delete from player', function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results.affectedRows);
	});
}

//Reomves a single player from player table.
function removePlayer(id,cb){
	var connection = get_connection();
	var query = 'delete from player where player.id = ?';
	connection.query(query,id,function(error, results, fields){
		if(error)
			cb(error, 0);
		else
			cb(null,results.affectedRows);
	});
}

function registerUser(user, cb) {
	var connection = get_connection();
	query = 'insert into user(name,user_name,password) values(?,?,?)';
	connection.query(query, [user.name,user.user_name,user.hash], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results);
	});
}

function createTournament(user_id,t_name,cb) {
	var connection = get_connection();
	var query = 'select count(name) as count from tournament where user_id=? and name=?';
	connection.query(query,[user_id,t_name],function(error,result){
		if(error){
			cb(error)
		}
		if(result[0].count>0){
			cb(true,0);
		}
		else {
			query = 'insert into tournament(user_id,name) values(?,?)';
			connection.query(query, [user_id,t_name], function (error, results, fields) {
				connection.end();
				if (error) {
					cb(error, 0);
				}
				cb(null, results);
			});
		}
	});
}

function hasTournaments(user_id,cb){
	var connection = get_connection();
	var query = 'select  count(*) as count from tournament where user_id=?';
	connection.query(query, [user_id], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results[0].count);
	});
}

function viewTournament(user_id,cb) {
	var connection = get_connection();
	var query = 'select  id,name,status,winner from tournament where user_id=?';
	connection.query(query, [user_id], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results);
	});
}

function isMatchStarted(t_id,cb) {
	var connection = get_connection();
	var query = 'select count(*) as count from game where tournament_id=?';
	connection.query(query, [t_id], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		cb(null, results[0].count);
	});
}

function getRoundStatus(t_id,count,cb) {
	var connection = get_connection();
	var query = 'select max(round) max_round from game where tournament_id=?';
	connection.query(query, [t_id], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		else{
			var arr=[]
			for(var i=0;i<Math.log2(count);i++){
					arr.push('Not Started');
				}

			if(results[0].max_round==null){
				cb(null, arr);
			}
			else{
				for(var i=0;i<results[0].max_round;i++){
					arr[i]='Completed';
				}
				console.log(arr);
				cb(null,arr);
			}

		}
	});
}

function getTournament(t_id,cb) {
	var connection = get_connection();
	var query = 'select * from tournament where id=?';
	connection.query(query, [t_id], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		console.log(results[0])
		cb(null, results[0]);
	});
}


/*
Stores the outcome of a single match between two players in the database.
*/
function reportMatch(t_id,round, winner_id, loser_id, cb) {
	buildTournament(t_id,function(error, tournament){
		var connection = get_connection();
		if (tournament.hasPlayedInRound(winner_id, loser_id, round)) {
			throw `Player ${winner_id} has already played with player ${loser_id} in round ${round}`;
		}
		else {
			var query = `
			insert into game(tournament_id,player1_id, player2_id, round, winner_id, loser_id)
			values(?,?,?,?,?,?)
			`
			connection.query(query, [t_id,winner_id, loser_id, round, winner_id, loser_id],
				function (error, results, fields) {
					connection.end();
					if (error) {
						cb(error, 0);
					}
					cb(null, results.affectedRows);
				});
		}
	});
}

function setStatus(t_id,count,round,cb){
	var connection = get_connection();
	var query = `update tournament set status='In progress' where id=?`
	if(round<Math.log2(count)){
		var status = 'In Progress'
		var query = `update tournament set status='In progress' where id=?`
		connection.query(query,t_id,function(err,res){
			connection.end();
			if(res){
				cb(null,status)
			}
		})
	}
	else {
		var status = 'Completed'
		var query = `update tournament set status='Completed' where id=?`
		connection.query(query,t_id,function(err,reslt){
			connection.end();
			if(reslt){
				cb(null,status);
			}
		})
	}
}

function getroundResult(t_id,round, cb){
	var stmt =
	`select (select name from player p where p.id = g.player1_id and g.tournament_id=p.tournament_id)
	 as player1_name,
    (select name from player p where p.id = g.player2_id and g.tournament_id=p.tournament_id)
     as player2_name,
    (select name from player p where p.id=g.winner_id and g.tournament_id=p.tournament_id)
    as winner_name
    	from game g
    where g.tournament_id = ? and round = ?;`
	var connection = get_connection();
	connection.query(stmt,[t_id, round],function(error, results){
		connection.end();
		if(error){
			throw error;
		}
		cb(null,results);
	});
}


/*
Returns a list of (id, name, wins,Losses, matches) for each player, sorted by the number of wins each player has.
*/
function playerStandings(t_id,cb) {
	var connection = get_connection();
	var query = `
		select p.id, p.name as Name, (ifnull(ws.wins,0) + ifnull(ls.losses,0)) as Matches,
			ifnull(ws.wins, 0) as Wins,ifnull(ls.losses,0) as Losses

        from
            (select * from player where player.tournament_id = ?) as p
            left outer join
            ((select winner_id, count(*) as wins from game
                                where tournament_id = ?
                                group by winner_id) as ws)
                on (p.id = ws.winner_id)
            left outer join
            ((select loser_id, count(*) as losses from game
                                where tournament_id = ?
                                        group by loser_id) as ls)
                on (p.id = ls.loser_id)
        where p.tournament_id = ?
        order by
        wins desc`

	connection.query(query,[t_id,t_id,t_id,t_id], function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		var out = [];
		for (var result of results) {
			out.push({
				id: result.id,
				Name: result.Name,
				Wins: result.Wins,
				Losses: result.Losses,
				Matches: result.Matches
			})
		}
		cb(null, out);
	});
}

function checkUser(user_name,pswd,cb){
	var connection = get_connection();
	var query = "select * from user where user_name=?";
	connection.query(query,user_name,function(error, results){
		if(error)
			cb(error,null);
		else
			cb(null,results[0]);
	})
}

function setWinner(t_id,winner,cb){
	var connection = get_connection();
	var query = `update tournament set winner=? where id=?`;
	connection.query(query,[winner,t_id],function(error, results){
		if(error)
			cb(error,null);
		else{
			cb(null,1);
		}
	})

}

function getMaxRound(t_id,cb){
	var connection = get_connection();
	var query = "select max(round) as max_round from game where tournament_id=?";
	connection.query(query,t_id,function(error, results){
		if(error)
			cb(error,null);
		else{
			console.log(results)
			cb(null,results[0]);
		}
	})
}
function buildTournament(t_id,cb) {
	var connection = get_connection();
	connection.query('select * from game where tournament_id=?', t_id,function (error, results, fields) {
		connection.end();
		if (error) {
			cb(error, 0);
		}
		var t = new Tournament();
		for (var result of results) {
			var g = new Game(result.player1_id, result.player2_id,
				result.winner_id, result.loser_id, result.round);
			t.addGame(g);
		}
		cb(null, t);
	});
}


/*
Given the existing set of registered players and the matches they have played,
generates and returns a list of pairings according to the Swiss system.
Each pairing is a tuple (id1, name1, id2, name2), giving the ID and name of the paired players.
For instance, if there are eight registered players, this function should return four pairings.
This function should use playerStandings to find the ranking of players.
*/

function getNextPair(playerStandings, tournament) {
	var first = playerStandings.splice(0,1)[0];
	for (var i=0; i<playerStandings.length; i++) {
		if (!tournament.hasPlayed(first.id, playerStandings[i].id)) {
			var second = playerStandings.splice(i,1)[0];
			return [first, second];
		}
	}
	//throw 'Swiss pairing algorithm failed';
	throw "Tournament finished.Cann't execute more rounds";

}

function swissPairings(t_id,cb) {
	playerStandings(t_id,function(error, playerStandings) {
		if (error) {
			throw error;
		}
		else {
			pairings = [];
			buildTournament(t_id,function(error, tournament){
				while (playerStandings.length > 0) {
					pairings.push(getNextPair(playerStandings, tournament));
				}
				cb(null, pairings);
			});
		}
	})
}

module.exports = {
	registerNewPlayer: registerNewPlayer,
	registerExistingPlayer: registerExistingPlayer,
	registerUser: registerUser,
	removePlayer: removePlayer,
	countPlayers: countPlayers,
	deletePlayers: deletePlayers,
	swissPairings: swissPairings,
	reportMatch: reportMatch,
	playerStandings: playerStandings,
	checkUser: checkUser,
	createTournament: createTournament,
	viewTournament: viewTournament,
	buildTournament: buildTournament,
	isMatchStarted: isMatchStarted,
	seePlayers: seePlayers,
	getTournament: getTournament,
	setStatus: setStatus,
	existingPlayers: existingPlayers,
	getroundResult: getroundResult,
	getRoundStatus: getRoundStatus,
	getMaxRound:getMaxRound,
	get_connection:get_connection,
	setWinner: setWinner,
	hasTournaments: hasTournaments
}
