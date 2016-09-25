var crypto = require("crypto");

var Room = require("./room");

module.exports = class Player {
	constructor(game, name) {
		this.name = name;
		this.id; // will be set by something else
		this.authToken = crypto.randomBytes(16).toString("hex");
		this.game = game;

		this.room = null;

		// Will be set by the room
		this.hand;
		this.score;
		this.profession;
		this.pitch;
		this.pitchRevealed;

		this.eventListener = null;
		this.eventQueue = [];

		this.emit("/cardpacks");

		// Trigger and expect a /heartbeat every 30 seconds
		this.heartbeatTimeout = null;
		setInterval(() => {
			this.emit("/heartbeat");

			// If we don't get a /heartbeat request within 2 seconds
			// of the /heartbeat event, we destroy the player
			this.heartbeatTimeout = setTimeout(() => this.destroy(), 2000);
		}, 3000);
	}

	// Create a room.
	//     The player will be the operator of the created room.
	//     The player will join the newly created room.
	createRoom(name, cardpacknames) {
		if (cardpacknames.length < 1)
			throw "Need at least 1 card pack";

		var room = new Room(this.game, name, this, cardpacknames);
		this.game.registerRoom(room);
		this.joinRoom(room);
	}

	// Join a room.
	//     If a room is already joined, leave that room.
	joinRoom(room) {
		if (this.room)
			this.leaveRoom();

		room.registerPlayer(this);
		this.room = room;

		this.emit("/room");
		this.emit("/roles");
		this.emit("/hand");
	}

	// Leave a room.
	//     Reset the game data (hand, score, etc).
	//     Notify the room about the player leaving.
	leaveRoom() {
		this.resetGameData();
		if (this.room) {
			this.room.removePlayer(this);
			this.room = null;

			this.emit("/room");
		}
	}

	// Reset the data related to rooms.
	resetGameData() {
		this.hand = [];
	}

	// Add an event listener.
	//     If there already exists one, that response is ended.
	//     If there's stuff in the event queue, respond immediately.
	//     If the queue is empty, just save the response object.
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

	// Emit an event.
	//     If there's already a listener, end that response and clear the queue.
	//     Otherwise, just add it to the queue.
	emit(url) {
		this.eventQueue.push(url);

		if (this.eventListener) {
			this.eventListener.data(this.eventQueue);
			this.eventListener = null;
			this.eventQueue = [];
		}
	}

	// Destroy the player.
	//     Notify the room and the game that the player.
	//     Emit a /register event; the client will have to register again.
	destroy() {
		if (this.room) {
			this.room.removePlayer(this);
			this.room = null;
		}

		this.game.removePlayer(this);
		this.emit("/register");
	}

	// Heartbeat, preventing the player from being destroyed.
	heartbeat() {
		if (this.heartbeatTimeout !== null) {
			clearTimeout(this.heartbeatTimeout);
			this.heartbeatTimeout = null;
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
