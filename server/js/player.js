var Room = require("./room");

module.exports = class Player {
	constructor(game, name) {
		this.name = name;
		this.id; // will be set by something else

		this.game = game;
		this.room = null;

		this.eventListener = null;
		this.eventQueue = [];
	}

	createRoom(name, password) {
		var room = new Room(this.game, name, password, this);
		this.game.registerRoom(room);
		this.room = room;
		this.emit("/players");
		this.emit("/roles");
	}

	joinRoom(room, password) {
		if (this.room)
			this.leaveRoom();

		room.registerPlayer(this, password);
		this.room = room;

		this.emit("/room");
		this.emit("/roles");
	}

	leaveRoom() {
		if (this.room) {
			this.room.removePlayer(this);
			this.room = null;

			this.emit("/room");
		}
	}

	/*
	 * Event related stuff
	 */

	addListener(res) {
		if (this.eventListener)
			this.eventListener.err("Another event listener takes your place.");

		if (this.eventQueue.length > 0) {
			res.json(this.eventQueue);
			this.eventListener = null;
			this.eventQueue = [];
		} else {
			this.eventListener = res;
		}
	}

	emit(url) {
		this.eventQueue.push(url);
		if (this.eventListener) {
			this.eventListener.json(this.eventQueue);
			this.eventQueue = [];
		}
	}

	serialize() {
		return {
			id: this.id,
			name: this.name
		};
	}
}
