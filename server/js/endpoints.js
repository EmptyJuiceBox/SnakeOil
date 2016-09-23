var User = require("./user");

function register(game, player, res, opts) {
	var u = new User(opts.name);
	var id = game.registerUser(u);
	res.data({ id: id });
}

module.exports = function(eplist) {
	function ep(method, path, fn, props) {
		props.method = method;
		props.fn = fn;
		eplist[path] = props;
	}

	ep("POST", "/register", register, {
		args: [ [ "name", "string" ] ],
		noId: true
	});
}
