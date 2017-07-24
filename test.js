var swiss = require ('./lib/swisstourney.js');
// swiss.getRoundStatus(2,8,function(){})
// select count(distinct name) from player where user_id=30 and tournament_id not in (57) and
// name not in(select name from player where tournament_id=57)

// (select * from player where player.name='Rajendra') as p
//              join
//             ((select count(*) as wins from game
//                                 group by winner_id) as ws)
//                 on (p.id = ws.winner_id)
//              join
//             ((select count(*) as losses from game
//                                         group by loser_id) as ls)
//                 on (p.id = ls.loser_id)
//         where p.user_id=11762312340499;
swiss.countPlayers(5,function(err,res){
    console.log(err);
    console.log(res)
})
