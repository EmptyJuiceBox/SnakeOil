var cardpacks = require("./cardpacks");

var cardsPerPlayer = 6;

module.exports = class Room {
	constructor(game, name, password, operator, cardpacknames) {
		this.name = name;
		this.id; // will be set by something else

		this.game = game;
		this.operator = operator;

		this.words = cardpacknames
			.map(c => cardpacks[c].words)
			.reduce((acc, arr) => acc.concat(arr), []);
		this.professions = cardpacknames
			.map(c => cardpacks[c].professions)
			.reduce((acc, arr) => acc.concat(arr), []);

		this.players = [];
		this.password = password;
	}

	registerPlayer(player, password) {
		if (!this.password || password === this.password) {
			this.players[player.id] = player;
			this.players.forEach(u => u.emit("/players"));

		} else {
			throw "Invalid password";
		}
	}

	removePlayer(player) {
		if (player == this.operator) {
			this.destroy();
		} if (this.players[player.id]) {
			this.players[player.id] = undefined;
			this.players.forEach(u => u.emit("/players"));
		}
	}

	setPlayerHand(player) {
		player.hand = [];
		for (var i = 0; i < cardsPerPlayer; ++i)
			player.hand.push(this.randomWord());
	}

	destroy() {
		this.players.forEach(u => u.leaveRoom());
		this.game.removeRoom(this);
	}

	serialize() {
		return {
			id: this.id,
			name: this.name
		};
	}

	serializePlayers() {
		return this.players.map(u => u.serialize());
	}

	serializeRoles() {
		return {
			operator: this.operator.id,
		};
	}

	randomWord() {
		var i = Math.floor(Math.random() * this.words.length);
		return this.words[i];
	}

	randomProfession() {
		var i = Math.floor(Math.random() * this.professions.length);
		return this.professions[i];
	}
}
