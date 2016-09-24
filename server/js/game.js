var UniqueMap = require("./unique-map");

module.exports = class Game {
	constructor() {
		this.players = new UniqueMap();
		this.rooms = new UniqueMap();
	}

	/*
	 * Player stuff
	 */

	// Register a player and set its ID
	registerPlayer(player) {
		var id = this.players.insert(player);
		player.id = id;
		return id;
	}

	// Remove a player, notifying its room in the process
	removePlayer(player) {
		if (this.players.contains(player.id)) {
			if (player.room)
				player.room.removePlayer(player);

			this.players.delete(player.id);
		}
	}

	// Get a player by ID
	getPlayer(id) {
		return this.players.get(id);
	}

	/*
	 * Room stuff
	 */

	// Register a new room and set its ID
	registerRoom(room) {
		var id = this.rooms.insert(room);
		room.id = id;
		return id;
	}

	// Remove a room, which notifies all its players
	removeRoom(room) {
		if (this.rooms.get(room.id)) {
			room.destroy();
			this.rooms.delete(room.id);
		}
	}

	// Get a room by ID
	getRoom(id) {
		return this.rooms.get(id);
	}
}
