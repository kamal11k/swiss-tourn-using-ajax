create table user (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    name CHAR(20) NOT NULL,
    user_name VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL

);

create table tournament (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES user(id)
    ON DELETE CASCADE
        ON UPDATE CASCADE,
    name CHAR(20) NOT NULL,
    status CHAR(50) DEFAULT 'Not Started',
    winner CHAR(20) DEFAULT 'Not declared'
);


create table player (
	id INT NOT NULL AUTO_INCREMENT,
	name CHAR(100),
    user_id VARCHAR(100) NOT NULL REFERENCES user(id),
	tournament_id INT NOT NULL REFERENCES tournament(id)
	ON DELETE CASCADE
        ON UPDATE CASCADE,
    PRIMARY KEY(id,tournament_id)
	);

create table game (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	tournament_id INT NOT NULL REFERENCES tournament(id)
	ON DELETE CASCADE
        ON UPDATE CASCADE,
	player1_id INT NOT NULL REFERENCES player(id)
	ON DELETE CASCADE
        ON UPDATE CASCADE,
	player2_id INT NOT NULL REFERENCES player(id)
	ON DELETE CASCADE
        ON UPDATE CASCADE,
	round smallint NOT NULL,
	winner_id INT NOT NULL REFERENCES player(id)
	ON DELETE CASCADE
        ON UPDATE CASCADE,
	loser_id INT NOT NULL REFERENCES player(id)
	ON DELETE CASCADE
        ON UPDATE CASCADE
	);
