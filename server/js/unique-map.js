var crypto = require("crypto");

module.exports = class UniqueMap {
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

	set(id, val) {
		this.items[id] = val;
	}

	delete(id) {
		this.items[id] = undefined;
	}

	contains(id) {
		return this.items[id] !== undefined;
	}

	forEach(fn) {
		for (var i in this.items) {
			if (this.items[i] !== undefined)
				fn(this.items[i]);
		}
	}

	map(fn) {
		var arr = [];
		this.forEach(i => arr.push(fn(i)));
		return arr;
	}
}