module.exports = class Room {
	constructor(game, name, password, operator) {
		this.name = name;
		this.id; // will be set by something else

		this.game = game;
		this.operator = operator;

		this.users = [operator];
		this.password = password;
	}

	registerUser(user, password) {
		if (!this.password || password === this.password) {
			this.users[user.id] = user;
			this.users.forEach(u => u.emit("/room"));
		} else {
			throw "Invalid password";
		}
	}

	removeUser(user) {
		if (user == this.operator) {
			this.destroy();
		} if (this.users[user.id]) {
			delete this.users[user.id];
			this.users.forEach(u => u.emit("/room"));
		}
	}

	destroy() {
		this.users.forEach(u => u.leaveRoom());
		this.game.removeRoom(this);
	}

	serialize() {
		return {
			id: this.id,
			name: this.name,
			users: this.users.map(u => u.serialize())
		};
	}
}
