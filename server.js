const app = require("./app")
const https = require("https")
const fs = require("fs")
var debug = require("debug")("htpps-server:server")

const options = {
    key: fs.readFileSync(
        "certificates\\cert.key"
    ),
    cert: fs.readFileSync(
        "certificates\\cert.crt"
    ),
};

function onError(error) {t
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}

var server = https.createServer(options, app);
let port = process.env.PORT || 443;
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);