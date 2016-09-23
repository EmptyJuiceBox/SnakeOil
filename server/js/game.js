module.exports = class Game {
	constructor() {
		this.users = [];
		this.rooms = [];
	}

	/*
	 * User stuff
	 */

	registerUser(user) {
		var id = this.users.length;
		this.users.push(user);
		user.id = id;
		return id;
	}

	removeUser(user) {
		if (this.users[user.id]) {
			if (user.room)
				user.room.removeUser(user);
			delete this.users[user.id];
		}
	}

	getUser(id) {
		return this.users[id];
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
