var Player = require("./player");

/*
 * Register new player
 */

function ep_register(game, player, res, opts) {
	var u = new Player(game, opts.name);
	var id = game.registerPlayer(u);
	res.data({ id: id });
}

/*
 * Room related endpoints
 */

function ep_room_create(game, player, res, opts) {
	player.createRoom(opts.name, opts.password);
	res.data();
}

function ep_room_join(game, player, res, opts) {
	var room = game.getRoom(opts.id);
	if (!room)
		return res.err("Room doesn't exist.");

	player.joinRoom(room);
	res.data();
}

function ep_room_leave(game, player, res) {
	player.leaveRoom();
	res.data();
}

/*
 * Get information
 */

function ep_room(game, player, res) {
	if (player.room)
		res.data(player.room.serialize());
	else
		res.data(null);
}

function ep_players(game, player, res) {
	if (player.room)
		res.data(player.room.serializePlayers());
	else
		res.data(null);
}

function ep_roles(game, player, res) {
	if (player.room)
		res.data(player.room.serializeRoles());
	else
		res.data(null);
}

/*
 * Events
 */

function ep_event(game, player, res) {
	player.addListener(res);
}

module.exports = function(eplist) {
	function ep(method, path, fn, props) {
		props = props || {};
		props.method = method;
		props.fn = fn;
		eplist[path] = props;
	}

	/*
	 * Register new player
	 */

	ep("POST", "/register", ep_register, {
		args: [ [ "name", "string" ] ],
		noId: true
	});

	/*
	 * Room related endpoints
	 */

	ep("POST", "/room_create", ep_room_create, {
		args: [ [ "name", "string" ] ]
	});

	ep("POST", "/room_join", ep_room_join, {
		args: [ [ "id", "number" ] ]
	});

	ep("POST", "/room_leave", ep_room_leave);

	/*
	 * Get information
	 */

	ep("GET", "/room", ep_room);

	ep("GET", "/players", ep_players);

	ep("GET", "/roles", ep_roles);

	/*
	 * Events
	 */

	ep("POST", "/event", ep_event);
}
