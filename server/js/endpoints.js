var User = require("./user");

function ep_register(game, user, res, opts) {
	var u = new User(game, opts.name);
	var id = game.registerUser(u);
	res.data({ id: id });
}

function ep_room_create(game, user, res, opts) {
	user.createRoom(opts.name, opts.password);
	res.data();
}

function ep_room_join(game, user, res, opts) {
	var room = game.getRoom(opts.id);
	if (!room)
		return res.err("Room doesn't exist.");

	user.joinRoom(room);
	res.data();
}

function ep_room_leave(game, user, res) {
	user.leaveRoom();
	res.data();
}

function ep_room(game, user, res) {
	if (user.room) {
		res.data(user.room.serialize());
	} else {
		res.data(null);
	}
}

function ep_event(game, user, res) {
	user.addListener(res);
}

module.exports = function(eplist) {
	function ep(method, path, fn, props) {
		props = props || {};
		props.method = method;
		props.fn = fn;
		eplist[path] = props;
	}

	ep("POST", "/register", ep_register, {
		args: [ [ "name", "string" ] ],
		noId: true
	});

	ep("POST", "/room_create", ep_room_create, {
		args: [ [ "name", "string" ] ]
	});

	ep("POST", "/room_join", ep_room_join, {
		args: [ [ "id", "number" ] ]
	});

	ep("GET", "/room", ep_room);


	ep("POST", "/event", ep_event);
}
