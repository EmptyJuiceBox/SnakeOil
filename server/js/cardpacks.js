var fs = require("fs");
var pathlib = require("path");

function loadf(path) {
	return fs.readFileSync(path, "utf-8")
		.trim()
		.split("\n");
}

function load(name) {
	return {
		words: loadf(pathlib.join("cardpacks", name, "words")),
		professions: loadf(pathlib.join("cardpacks", name, "professions"))
	};
}

module.exports = {
	"Elixir": load("elixir"),
	"Original": load("original"),
	"Politics": load("politics")
}
