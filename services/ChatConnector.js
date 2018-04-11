var WebSocket = require('ws');
var AiEngine = require("./endpoints/ai.engine");
var util = require("./util");

var webSocketServer = new WebSocket.Server({ port: 8000 });

webSocketServer.on('connection', function connection(client, req) {
    var sId = client.protocol;
    var token = req.url.replace("/token=", "");
    var details = new Buffer(token, 'base64').toString('ascii');
    try {
        client.details = JSON.parse(details);
    } catch (e) {
        client.details = {};
    }

    if (sId.indexOf("user_") == 0) {
        util.users[client.protocol] = client;
        new AiEngine(client, sId).start();

    } else if (sId.indexOf("agent_") == 0) {
        util.agents[client.protocol] = client;
    }

});

module.exports = webSocketServer;   