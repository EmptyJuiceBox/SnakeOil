var http = require("http");
var urllib = require("url");

var endpoints = require("./js/endpoints");
var Game = require("./js/game");

var game = new Game();

function handleRequestWithPayload(player, payload, ep, res) {
	var obj;
	if (payload === "") {
		obj = {};
	} else {
		try {
			obj = JSON.parse(payload);
		} catch (err) {
			return res.err(err);
		}
	}

	if (ep.args) {
		var missing = [];

		// a[0] is the name, obj[1] is the type
		ep.args.forEach(a => {
			if (obj[a[0]] === undefined || typeof obj[a[0]] !== a[1])
				missing.push(a[0]+" ("+a[1]+")");
		});

		if (missing.length > 0)
			return res.err("Missing arguments: "+missing.join(", "));
	}

	try {
		ep.fn(game, player, res, obj);
	} catch (err) {
		res.err(err);
	}
}

function resJson(obj) {
	this.end(JSON.stringify(obj));
}

function resData(data) {
	this.json({
		err: null,
		data: data
	});
}

function resError(msg) {
	this.json({
		err: msg.toString(),
		data: null
	});

	if (msg instanceof Error) {
		console.trace(msg);
	}
}

var eplist = {};
function handler(req, res) {
	var url = urllib.parse(req.url);

	var ep = eplist[url.path];
	if (!ep || ep.method != req.method) {
		res.writeHead(404);
		res.end("404 Not Found");
		return;
	}

	// Set utility functions to response object
	res.json = resJson;
	res.data = resData;
	res.err = resError;

	// Find the ID cookie if supplied
	var c = req.headers.cookie;
	var m = (c ? req.headers.cookie.match(/id=([^;$]+)/) : null);
	var id = (m ? m[1] : null);

	// If the endpoint requires an id, and there's no id cookie, error
	if (!ep.noId && id == null)
		return res.err("No id cookie provided");

	// Get the player if there's an ID cookie
	var player = (id === null ? null : game.getPlayer(id));

	// If it's a POST request, get the payload
	if (req.method == "POST") {
		var str = "";
		req
			.on("data", d => str += d)
			.on("end", () => {
				handleRequestWithPayload(player, str, ep, res);
			});
	} else {
		try {
			ep.fn(game, player, res);
		} catch (err) {
			res.err(err);
		}
	}
}

endpoints(eplist);

http.createServer(handler).listen(8080);
