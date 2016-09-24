var pathlib = require("path");
var fs = require("fs");

var mimes = {
	".html": "text/html",
	".js": "application/javascript",
	".css": "text/css",

	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",

	".wav": "audio/wav",
	".ogg": "audio/ogg",
	".mp3": "audio/mp3"
};

module.exports = class Fileserver {
	constructor(root) {
		this.root = root;
	}

	serveDir(urlpath, path, stat, res) {
		if (urlpath[urlpath.length - 1] !== "/") {
			res.writeHead(302, {
				location: urlpath+"/"
			});
			res.end();
			return;
		}

		this.serveFile(urlpath, pathlib.join(path, "index.html"), null, res);
	}

	serveFile(urlpath, path, stat, res) {
		if (!stat) {
			fs.stat(path, (err, stat) => {
				if (err) {
					res.writeHead(400);
					res.end(err.toString());
					return;
				}

				this.serveFile(urlpath, path, stat, res);
			});
			return;
		}

		var mime = mimes[pathlib.extname(path).toLowerCase()]
			|| "application/octet-stream";

		res.writeHead(200, {
			"content-type": mime,
			"content-length": stat.size
		});
		fs.createReadStream(path)
			.pipe(res)
			.on("error", err => res.end(err.toString()));
	}

	serve(urlpath, res) {
		var path = pathlib.join(this.root, urlpath);

		fs.stat(path, (err, stat) => {
			if (err) {
				res.writeHead(400);
				res.end(err.toString());
				return;
			}

			if (stat.isDirectory()) {
				this.serveDir(urlpath, path, stat, res);
			} else if (stat.isFile()) {
				this.serveFile(urlpath, path, stat, res);
			} else {
				res.writeHead(404);
				res.end("404 Not Found: "+urlpath);
			}
		});
	}
}
