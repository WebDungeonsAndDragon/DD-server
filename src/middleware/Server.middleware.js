const app = require("./ExpressApp.middleware");

const server = require("http").createServer(app);

server.listen(process?.env?.PORT || 8081);

module.exports = server;
