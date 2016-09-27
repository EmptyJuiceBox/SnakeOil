var crypto = require("crypto");

module.exports = class UniqueMap {
	constructor() {
		this.idLen = 3;
		this.items = {};
	}

	genId() {
		for (var i = 0; i < 4; ++i) {
			var id = crypto.randomBytes(this.idLen)
				.toString("hex")
				.toUpperCase();
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
		return this.items[id.toUpperCase()];
	}

	set(id, val) {
		this.items[id.toUpperCase()] = val;
	}

	delete(id) {
		this.items[id.toUpperCase()] = undefined;
	}

	contains(id) {
		return this.items[id.toUpperCase()] !== undefined;
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

	nth(n) {
		var i = 0;
		for (var j in this.items) {
			if (this.items[j] !== undefined && i === n)
				return this.items[j];
			else
				i += 1;
		}
		return undefined;
	}

	after(item) {
		var encountered = false;
		for (var j in this.items) {
			if (this.items[j] === item)
				encountered = true;
			else if (encountered)
				return this.items[j];
		}
		return undefined;
	}

	length() {
		var len = 0;
		for (var i in this.items) {
			if (this.items[i] !== undefined)
				len += 1;
		}
		return len;
	}
}
