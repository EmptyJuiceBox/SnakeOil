var User = require("./user");

function ep_register(game, user, res, opts) {
	var u = new User(opts.name);
	game.registerUser(u);
	res.data({ id: id });
}

function ep_room_create(game, user, res, opts) {
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

	ep("POST", "/event", ep_event);
}
