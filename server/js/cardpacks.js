var fs = require("fs");
var pathlib = require("path");

function load(name) {
	return fs.readFileSync(pathlib.join("cardpacks", name), "utf-8")
		.trim()
		.split("\n");
}

module.exports = {
	"Standard": load("standard")
}
