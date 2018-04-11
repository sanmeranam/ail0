

var VirtualAgent = function (baseClient, responseClient, observer) {
    this.baseClient = baseClient;
    this.responseClient = responseClient;
    this.observer = observer;
};

VirtualAgent.prototype.start = function (isNew) {
    this._pipeEndUserToAgent();
    this._pipeAgentToEndUser();


    if (isNew) {
        this.sendWelcomeMessageToUser();
    } else {
        this.sendWelcomeMessageToAgent();
    }
};

VirtualAgent.prototype._pipeEndUserToAgent = function () {
    //User messaget to agent
    this.baseClient.on('message', function (message) {
        messageJSON = this.observer(message);
        if (messageJSON) {
            this.responseClient.send(JSON.stringify(messageJSON));
        }
    }.bind(this));

    this.baseClient.on("close", function (message) {
        this.sendCloseToAgent();
    }.bind(this));

    this.baseClient.on("error", function (message) {
        this.sendCloseToAgent();
    }.bind(this));

};

VirtualAgent.prototype._pipeAgentToEndUser = function () {
    //Agent message to user
    this.responseClient.on("message", function (message) {
        messageJSON = this.observer(message);
        if (messageJSON) {
            this.baseClient.send(JSON.stringify(messageJSON));
        }

    }.bind(this));

    this.responseClient.on("close", function (message) {
        this.sendCloseToUser();
    }.bind(this));

    this.responseClient.on("error", function (message) {
        this.sendCloseToUser();
    }.bind(this));
};


VirtualAgent.prototype.stop = function () {
    this.responseClient.on("message", function (message) { });
    this.baseClient.on('message', function (message) { });
};

VirtualAgent.prototype.sendSystemMessageToAgent = function (OMsg) {
    this.responseClient.send(JSON.stringify(OMsg));
};

VirtualAgent.prototype.sendSystemMessageToUser = function (OMsg) {
    this.baseClient.send(JSON.stringify(OMsg));
};

VirtualAgent.prototype.sendWelcomeMessageToUser = function () {
    this.baseClient.send(JSON.stringify({
        type: "message",
        from: "bot",
        session: this.responseClient.protocol,
        details: this.responseClient.details,
        text: "Hi, How may I help you today !"
    }));
};

VirtualAgent.prototype.sendWelcomeMessageToAgent = function () {
    this.responseClient.send(JSON.stringify({
        type: "info",
        from: "bot",
        tag: "details",
        session: this.baseClient.protocol,
        text: this.baseClient.details
    }));
};


VirtualAgent.prototype.sendCloseToAgent = function () {
    if (this.responseClient && this.responseClient.readyState === 1) {
        this.responseClient.send(JSON.stringify({
            type: "info",
            from: "bot",
            tag: "close",
            session: this.baseClient.protocol,
            text: "Customer is offline"
        }));
    }
};

VirtualAgent.prototype.sendCloseToUser = function () {
    if (this.baseClient && this.baseClient.readyState === 1) {
        this.baseClient.send(JSON.stringify({
            type: "info",
            from: "bot",
            tag: "close",
            session: this.responseClient.protocol,
            text: "Agent unreachable now."
        }));
    }
};






module.exports = VirtualAgent;