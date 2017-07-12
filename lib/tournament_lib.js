exports.Game = function(p1, p2, winner, loser, round) {
	this.p1 = p1;
	this.p2 = p2;
	this.winner = winner;
	this.loser = loser;
	this.round = round;
}

exports.Tournament = function() {
	this.games = [];
}

exports.Tournament.prototype.addGame = function(game) {
	this.games.push(game);
}

exports.Tournament.prototype.hasPlayed = function(p1, p2) {
	for (var game of this.games) {
		if ((game.p1 == p1 && game.p2 == p2) || (game.p1 == p2 && game.p2 == p1)) {
			return true;
		}
	}
	return false;
}

exports.Tournament.prototype.hasPlayedInRound = function(p1, p2, round) {
	for (var game of this.games) {
		if (game.round == round) {
			if ((game.p1 == p1 && game.p2 == p2) || (game.p1 == p2 && game.p2 == p1)) {
				return true;
			}
		}
	}
	return false;
}
