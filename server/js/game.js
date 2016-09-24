module.exports = class Game {
	constructor() {
		this.players = [];
		this.playersId = 0;

		this.rooms = [];
		this.roomsId = 0;
	}

	/*
	 * Player stuff
	 */

	registerPlayer(player) {
		var id = this.playersId++;
		this.players[id] = player;
		player.id = id;
		return id;
	}

	removePlayer(player) {
		if (this.players[player.id]) {
			if (player.room)
				player.room.removePlayer(player);
			this.players[player.id] = undefined;
		}
	}

	getPlayer(id) {
		return this.players[id];
	}

	/*
	 * Room stuff
	 */

	registerRoom(room) {
		var id = this.roomsId++;
		this.rooms[id] = room;
		room.id = id;
		return id;
	}

	removeRoom(room) {
		if (this.rooms[room.id]) {
			room.destroy();
			this.rooms[room.id] = undefined;
		}
	}

	getRoom(id) {
		return this.rooms[id];
	}
}
