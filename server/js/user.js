module.exports = class User {
	constructor(name, session) {
		this.name = name;
		this.session = session;

		this.eventListener = null;
		this.eventQueue = [];
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

	emit(data) {
		this.eventQueue.push(data);
		console.log(this.eventQueue);
		if (this.eventListener) {
			this.eventListener.json(this.eventQueue);
			this.eventQueue = [];
		}
	}
}
