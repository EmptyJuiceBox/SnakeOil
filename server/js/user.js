var Room = require("./room");

module.exports = class User {
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
	}

	joinRoom(room, password) {
		if (this.room)
			this.leaveRoom();

		room.registerUser(this, password);
		this.room = room;
	}

	leaveRoom() {
		if (this.room) {
			this.room = null;
			this.room.removeUser(this);
		}
	}

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
		console.log(this.eventQueue);
		if (this.eventListener) {
			this.eventListener.json(this.eventQueue);
			this.eventQueue = [];
		}
	}
}
