module.exports = class Game {
	constructor() {
		this.players = [];
		this.rooms = [];
	}

	/*
	 * Player stuff
	 */

	registerPlayer(player) {
		var id = this.players.length;
		this.players.push(player);
		player.id = id;
		return id;
	}

	removePlayer(player) {
		if (this.players[player.id]) {
			if (player.room)
				player.room.removePlayer(player);
			delete this.players[player.id];
		}
	}

	getPlayer(id) {
		return this.players[id];
	}

	/*
	 * Room stuff
	 */

	registerRoom(room) {
		var id = this.rooms.length;
		this.rooms.push(room);
		room.id = id;
		return id;
	}

	removeRoom(room) {
		if (this.rooms[room.id]) {
			room.destroy();
			delete this.rooms[room.id];
		}
	}

	getRoom(id) {
		return this.rooms[id];
	}
}
