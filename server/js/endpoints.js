var Player = require("./player");
var cardpacks = require("./cardpacks");

/*
 * Register new player
 */

function ep_register(game, player, res, opts) {
	var u = new Player(game, opts.name);
	var id = game.registerPlayer(u);
	res.data({ id: id, token: u.authToken });
}

/*
 * Get card pack names
 */

function ep_cardpacks(game, player, res) {
	res.data(Object.keys(cardpacks));
}

/*
 * Room related endpoints
 */

function ep_room_create(game, player, res, opts) {
	player.createRoom(opts.name, opts.password, opts.cardpacks);
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

function ep_hand(game, player, res) {
	res.data(player.serializeHand());
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
		noPlayer: true
	});

	/*
	 * Get card pack names
	 */

	ep("GET", "/cardpacks", ep_cardpacks);

	/*
	 * Room related endpoints
	 */

	ep("POST", "/room_create", ep_room_create, {
		args: [ [ "name", "string" ], [ "cardpacks", "object" ] ]
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

	ep("GET", "/hand", ep_hand);

	/*
	 * Events
	 */

	ep("POST", "/event", ep_event);
}
