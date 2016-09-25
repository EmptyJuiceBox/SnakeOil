var cardpacks = require("./cardpacks");
var UniqueMap = require("./unique-map");

var cardsPerPlayer = 6;
var pitchDuration = 2 * 1000 * 60; // 2 minutes

module.exports = class Room {
	constructor(game, name, operator, cardpacknames) {
		this.name = name;
		this.id; // will be set by something else
		this.game = game;

		this.destroyed = false;
		this.running = false;

		this.operator = operator;
		this.pitcher = null;
		this.customer = null;

		this.words = cardpacknames
			.map(c => cardpacks[c].words)
			.reduce((acc, arr) => acc.concat(arr), []);
		this.professions = cardpacknames
			.map(c => cardpacks[c].professions)
			.reduce((acc, arr) => acc.concat(arr), []);

		this.players = new UniqueMap();

		// Game logic stuff
		this.pitchTimeout = null;
	}

	// Register a player.
	//     Emit a /players event to all players.
	registerPlayer(player) {
		this.initPlayerGameData(player);
		this.players.set(player.id, player);
		this.emit("/players");

		if (this.players.length() >= 3) {
			this.running = true;
			this.round();
		}
	}

	// Remove a player.
	//     Destroy the room if the player is the operator.
	//     Emit a /players event to all players.
	removePlayer(player) {
		if (player == this.operator) {
			this.destroy();
		} if (this.players.contains(player.id)) {
			this.players.delete(player.id);
			this.emit("/players");
		}
	}

	// Set a player's game data(hand, score, etc)
	initPlayerGameData(player) {
		player.hand = [];
		player.score = 0;
		player.profession = null;

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
		var ret = {};
		this.players.map(p => {
			ret[p.id] = {
				"name": p.name,
				"score": p.score
			};
		});
		return ret;
	}

	serializeRoles() {
		return {
			operator: this.operator.id,
			pitcher: (this.pitcher ? this.pitcher.id : null),
			customer: (this.customer ? this.customer.id : null),
			profession: (this.customer ? this.customer.profession : null)
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

	// Emit event to all players.
	emit(name) {
		this.players.forEach(p => p.emit(name));
	}

	/*
	 * Game logic
	 */

	// End a pitch.
	//     If there's no more players who can be pitchers,
	//     the pitcher will be undefined (and thus null in /roles)
	roundPitchEnd() {
		clearTimeout(this.pitchTimeout);

		this.pitcher = this.players.after(this.pitcher);
		if (this.pitcher == this.customer)
			this.pitcher = this.players.after(this.customer);

		this.emit("/roles");
	}

	// Start a pitch.
	roundPitch() {
		this.pitchTimeout = setTimeout(() => {
			this.roundPitchEnd();
		}, pitchDuration);
	}

	// Choose a player's product.
	//     Increments the player's score.
	//     Ends the round, and begins a new one.
	roundChoose(player) {
		player.score += 1;
		this.round();
		this.emit("/players");
	}

	// Start a round.
	//     If there's not enough players to start a round,
	//     all roles will be null.
	round() {
		if (this.players.len() < 3) {
			this.running = false;
			this.customer = null;
			this.pitcher = null;
			this.emit("/roles");
			return;
		}

		// If there's already a customer, the next person becomes a customer,
		// and the first person becomes a pitcher
		if (this.customer) {
			this.customer.profession = null;
			var nc = this.players.after(this.customer);
			if (nc) {
				this.customer = nc;
				this.pitcher = this.players.nth(0)

			// There's no next customer, so we start a new round
			} else {
				this.customer = this.players.nth(0);
				this.pitcher = this.players.nth(1)
			}

		// If there's not already a customer, the first person becomes a customer,
		// and the second person becomes a pitcher
		} else {
			this.customer = this.players.nth(0);
			this.pitcher = this.players.nth(1);
		}

		this.customer.profession = this.randomProfession();

		this.emit("/roles");

		return true;
	}
}
