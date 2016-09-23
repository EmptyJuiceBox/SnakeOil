module.exports = class Game {
	constructor() {
		this.users = [];
	}

	registerUser(user) {
		var id = this.users.length;
		this.users.push(user);
		return id;
	}

	getUser(id) {
		return this.users[id];
	}
}
