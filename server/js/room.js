module.exports = class Room {
	constructor(game, name, password, operator) {
		this.name = name;
		this.id; // will be set by something else

		this.game = game;
		this.operator = operator;

		this.players = [operator];
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
}
