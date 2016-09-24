var crypto = require("crypto");

var Room = require("./room");

module.exports = class Player {
	constructor(game, name) {
		this.name = name;
		this.id; // will be set by something else
		this.authToken = crypto.randomBytes(16).toString("hex");

		this.game = game;
		this.room = null;

		this.hand = [];

		this.eventListener = null;
		this.eventQueue = [];

		this.emit("/cardpacks");
	}

	createRoom(name, password, cardpacknames) {
		if (cardpacknames.length < 1)
			throw "Need at least 1 card pack";

		var room = new Room(this.game, name, password, this, cardpacknames);
		this.game.registerRoom(room);
		this.joinRoom(room, password);
	}

	joinRoom(room, password) {
		if (this.room)
			this.leaveRoom();

		room.registerPlayer(this, password);
		this.room = room;

		this.emit("/room");
		this.emit("/roles");
		this.emit("/hand");

		room.setPlayerHand(this);
	}

	leaveRoom() {
		this.resetGameData();
		if (this.room) {
			this.room.removePlayer(this);
			this.room = null;

			this.emit("/room");
		}
	}

	resetGameData() {
		this.hand = [];
	}

	/*
	 * Event related stuff
	 */

	addListener(res) {
		if (this.eventListener)
			this.eventListener.err("Another event listener takes your place.");

		if (this.eventQueue.length > 0) {
			res.data(this.eventQueue);
			this.eventListener = null;
			this.eventQueue = [];
		} else {
			this.eventListener = res;
		}
	}

	emit(url) {
		this.eventQueue.push(url);
		if (this.eventListener) {
			this.eventListener.data(this.eventQueue);
			this.eventQueue = [];
		}
	}

	serialize() {
		return {
			id: this.id,
			name: this.name
		};
	}

	serializeHand() {
		return this.hand;
	}
}
