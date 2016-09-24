var crypto = require("crypto");

class UniqueMap {
	constructor() {
		this.idLen = 4;
		this.items = {};
	}

	genId() {
		for (var i = 0; i < 4; ++i) {
			var id = crypto.randomBytes(this.idLen).toString("hex");
			if (this.items[id] === undefined)
				return id;
		}

		// We couldn't find free keys in 4 tries; let's make the key length
		// be a bit longer
		this.idLen += 2;
		return this.genId();
	}

	insert(item) {
		var id = this.genId();
		this.items[id] = item;
		return id;
	}

	get(id) {
		return this.items[id];
	}

	delete(id) {
		this.items[id] = undefined;
	}
}

module.exports = class Game {
	constructor() {
		this.players = new UniqueMap();
		this.rooms = new UniqueMap();
	}

	/*
	 * Player stuff
	 */

	registerPlayer(player) {
		var id = this.players.insert(player);
		player.id = id;
		return id;
	}

	removePlayer(player) {
		if (this.players.get(player.id)) {
			if (player.room)
				player.room.removePlayer(player);
			this.players.delete(player.id);
		}
	}

	getPlayer(id) {
		return this.players.get(id);
	}

	/*
	 * Room stuff
	 */

	registerRoom(room) {
		var id = this.rooms.insert(room);
		room.id = id;
		return id;
	}

	removeRoom(room) {
		if (this.rooms[room.id]) {
			room.destroy();
			this.rooms.delete(room.id);
		}
	}

	getRoom(id) {
		return this.rooms.get(id);
	}
}
