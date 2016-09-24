var cardpacks = require("./cardpacks");
var UniqueMap = require("./unique-map");

var cardsPerPlayer = 6;

module.exports = class Room {
	constructor(game, name, operator, cardpacknames) {
		this.name = name;
		this.id; // will be set by something else
		this.destroyed = false;

		this.game = game;
		this.operator = operator;

		this.words = cardpacknames
			.map(c => cardpacks[c].words)
			.reduce((acc, arr) => acc.concat(arr), []);
		this.professions = cardpacknames
			.map(c => cardpacks[c].professions)
			.reduce((acc, arr) => acc.concat(arr), []);

		this.players = new UniqueMap();
	}

	// Register a player.
	//     Emit a /players event to all players.
	registerPlayer(player) {
		this.initPlayerGameData(player);
		this.players.set(player.id, player);
		this.players.forEach(p => p.emit("/players"));
	}

	// Remove a player.
	//     Destroy the room if the player is the operator.
	//     Emit a /players event to all players.
	removePlayer(player) {
		if (player == this.operator) {
			this.destroy();
		} if (this.players.contains(player.id)) {
			this.players.delete(player.id);
			this.players.forEach(p => p.emit("/players"));
		}
	}

	// Set a player's game data(hand, score, etc)
	initPlayerGameData(player) {
		player.hand = [];
		for (var i = 0; i < cardsPerPlayer; ++i)
			player.hand.push(this.randomWord());
	}

	// Destroy the room, notifying all players that it's destroyed.
	destroy() {
		if (!this.destroyed) {
			this.destroyed = true;
			this.players.forEach(p => p.leaveRoom());
			this.game.removeRoom(this);
		}
	}

	serialize() {
		return {
			id: this.id,
			name: this.name
		};
	}

	serializePlayers() {
		return this.players.map(p => { return {
			"name": p.name,
			"score": 0
		}});
	}

	serializeRoles() {
		return {
			operator: this.operator.id,
		};
	}

	// Get a random word.
	randomWord() {
		var i = Math.floor(Math.random() * this.words.length);
		return this.words[i];
	}

	// Get a random profession.
	randomProfession() {
		var i = Math.floor(Math.random() * this.professions.length);
		return this.professions[i];
	}
}
