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
 * Heartbeat
 */

function ep_heartbeat(game, player, res) {
	player.heartbeat();
	res.data();
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
	player.createRoom(opts.name, opts.cardpacks);
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

function ep_room_send_message(game, player, res, opts) {
	if (!player.room)
		return res.err("Room doesn't exist.");

	player.room.addChatMessage(player, opts.msg);
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

function ep_messages(game, player, res) {
	res.data(player.clearChatMessages());
}

/*
 * Do game stuff
 */

function ep_pitch_start(game, player, res, opts) {
	if (!player.room)
		return res.err("You're not in a room!");
	if (player !== player.room.pitcher)
		return res.err("You're not the pitcher!");

	var time = player.room.roundPitch(opts.cards);
	res.data({ time: time });
}

function ep_pitch_end(game, player, res) {
	if (!player.room)
		return res.err("You're not in a room!");
	if (player !== player.room.pitcher)
		return res.err("You're not the pitcher!");

	player.room.roundPitchEnd();
	res.data();
}

function ep_reveal(game, player, res) {
	if (!player.room)
		return res.err("You're not in a room!");
	if (player !== player.room.pitcher)
		return res.err("You're not the pitcher!");

	player.room.roundPitchReveal();
	res.data();
}

function ep_choose(game, player, res, opts) {
	if (!player.room)
		return res.err("You're not in a room!");
	if (player !== player.room.customer)
		res.err("You're not the customer!");

	var p = player.room.players.get(opts.player);
	if (!p)
		return res.err("Chosen player doesn't exist!");

	player.room.roundChoose(p);
	res.data();
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
	 * Heartbeat
	 */

	ep("POST", "/heartbeat", ep_heartbeat);

	/*
	 * Get card pack names
	 */

	ep("POST", "/cardpacks", ep_cardpacks);

	/*
	 * Room related endpoints
	 */

	ep("POST", "/room_create", ep_room_create, {
		args: [ [ "name", "string" ], [ "cardpacks", Array ] ]
	});

	ep("POST", "/room_join", ep_room_join, {
		args: [ [ "id", "string" ] ]
	});

	ep("POST", "/room_leave", ep_room_leave);

	ep("POST", "/room_send_message", ep_room_send_message, {
		args: [ [ "msg", "string" ] ]
	});

	/*
	 * Get information
	 */

	ep("POST", "/room", ep_room);

	ep("POST", "/players", ep_players);

	ep("POST", "/roles", ep_roles);

	ep("POST", "/hand", ep_hand);

	ep("POST", "/messages", ep_messages);

	/*
	 * Do game stuff
	 */

	ep("POST", "/pitch_start", ep_pitch_start, {
		args: [ [ "cards", Array ] ]
	});

	ep("POST", "/pitch_end", ep_pitch_end);

	ep("POST", "/reveal", ep_reveal, {
		args: [ ]
	});

	ep("POST", "/choose", ep_choose, {
		args: [ [ "player", "string" ] ]
	});

	/*
	 * Events
	 */

	ep("POST", "/event", ep_event);
}
