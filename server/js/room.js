var cardpacks = require("./cardpacks");
var UniqueMap = require("./unique-map");

var cardsPerPlayer = 6;
var pitchDuration = 2 * 60; // 2 minutes, in seconds

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
		if (player === this.operator) {
			this.destroy();
		} if (this.players.contains(player.id)) {
			this.players.delete(player.id);
			this.emit("/roles");
			this.emit("/players");

			if (player === this.pitcher)
				this.roundPitchEnd();
		}
	}

	// Set a player's game data(hand, score, etc)
	initPlayerGameData(player) {
		player.hand = [];
		player.score = 0;
		player.profession = null;
		player.pitch = [];
		player.pitchRevealed = false;

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
			var pitch = null;
			if (p.pitchRevealed)
				pitch = p.hand[p.pitch[0]] + " " + p.hand[p.pitch[1]];

			ret[p.id] = {
				name: p.name,
				score: p.score,
				pitch: pitch
			};
		});
		return ret;
	}

	serializeRoles() {
		return {
			operator: this.operator.id,
			pitcher: (this.pitcher ? this.pitcher.id : null),
			customer: (this.customer ? this.customer.id : null),
			profession: (this.customer ? this.customer.profession : null),
			pitch_started: (this.pitcher && this.pitcher.pitch.length > 0)
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

		if (! this.pitcher.pitchRevealed)
			this.roundPitchReveal();

		this.pitcher = this.players.after(this.pitcher);

		if (this.pitcher == this.customer)
			this.pitcher = this.players.after(this.customer);

		this.emit("/roles");
		this.emit("/players");
	}

	// Start a pitch.
	//     Returns the maximum length of the pitch.
	roundPitch(cards) {
		this.pitcher.pitch = cards;

		this.pitchTimeout = setTimeout(() => {
			this.roundPitchEnd();
		}, pitchDuration * 1000);

		this.emit("/roles");
		this.emit("/players");

		return pitchDuration;
	}

	// Reveal the pitch
	roundPitchReveal() {
		this.pitcher.pitchRevealed = true;

		this.emit("/roles");
		this.emit("/players");
	}

	// Choose a player's product.
	//     Increments the player's score.
	//     Ends the round, and begins a new one.
	roundChoose(player) {
		if (this.running)
			player.score += 1;

		this.round();
		this.emit("/players");
	}

	// Start a round.
	//     If there's not enough players to start a round,
	//     all roles will be null.
	round() {

		// Reset all players' pitches, and replace cards in the hand
		this.players.forEach(p => {
			if (p.pitchRevealed) {
				p.pitch.forEach(i => p.hand[i] = this.randomWord());
				p.emit("/hand");
			}

			p.pitch = [];
			p.pitchRevealed = false;
		});

		if (this.players.length() < 3) {
			this.running = false;
			this.customer = null;
			this.pitcher = null;
			this.emit("/roles");
			this.emit("/players");
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
		this.emit("/players");

		return true;
	}
}
