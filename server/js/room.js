var cardpacks = require("./cardpacks");

var cardsPerPlayer = 6;

module.exports = class Room {
	constructor(game, name, password, operator, cardpacknames) {
		this.name = name;
		this.id; // will be set by something else

		this.game = game;
		this.operator = operator;

		this.cardpack = cardpacknames
			.map(c => cardpacks[c])
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
			player.hand.push(this.randomCard());
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

	randomCard() {
		var i = Math.floor(Math.random() * this.cardpack.length);
		return this.cardpack[i];
	}
}
