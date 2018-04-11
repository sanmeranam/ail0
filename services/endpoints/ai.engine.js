var ReactConverse = require("./recast.converse");
var VirtualAgent = require("./virtualAgent");
var Util = require("../util");
var fileDB = require("../fileDb");


var AiEngine = function (client) {
    this.client = client;
    this.history = [];
    this.unsolvedQustion = null;
};

AiEngine.prototype.start = function () {
    this.reactClient = new ReactConverse();
    this.systemAgent = new VirtualAgent(this.client, this.reactClient, this._chatObserver.bind(this));
    this.systemAgent.start(true);
};

AiEngine.prototype._checkInternalSolution = function (message) {
    var res;

    var his = this.history.reverse();
    for (var i in his) {
        if (his[i].from == "user") {

            if (res = this._check(his[i].text)) {
                return res;
            } else {
                this.unsolvedQustion = his[i];
            }
            break;
        }
    }
};

AiEngine.prototype._check = function (message) {
    var oFile = fileDB.getJSON();
    if (oFile[message]) {
        return oFile[message];
    }
    return null;
}


AiEngine.prototype._updateAnsDB = function () {
    if (this.unsolvedQustion) {
        var oFile = fileDB.getJSON();
        oFile[this.unsolvedQustion.text] = this.unsolvedQustion.ans;
        fileDB.setJSON(oFile);
    }
}




AiEngine.prototype._chatObserver = function (message) {
    var oMsg = JSON.parse(message);

    if (oMsg.type === "message") {
        if (oMsg.text.indexOf("I did not understand what  you said") > -1) {
            var sText = this._checkInternalSolution(oMsg.text);
            if (sText) {
                oMsg.text = sText;
                delete (oMsg.quick);
            } else {
                return oMsg;
            }
        }

        switch (oMsg.tag) {
            case "option":
                if (oMsg.text === "support") {
                    if (this._switchToAgent()) {
                        this.systemAgent.stop();
                    } else {
                        this.systemAgent.sendSystemMessageToUser(this._SYSTEM_MESSAGE.AGENT_NOT_AVAILABLE);
                    }
                    return null;
                }
                break;
            case "solution":
                if (this.unsolvedQustion) {
                    this.unsolvedQustion.ans = oMsg.text;
                    this._updateAnsDB();
                }
                break;
        }
        this.history.push(oMsg);
        return oMsg;
    } else if (oMsg.type === "info") {
        switch (oMsg.tag) {
            case "SWITCH":
                if (this._switchToAgent()) {
                    this.systemAgent.stop();
                } else {
                    this.systemAgent.sendSystemMessageToUser(this._SYSTEM_MESSAGE.AGENT_NOT_AVAILABLE);
                }
                break;
        }
    }



    return null;
};


AiEngine.prototype._switchToAgent = function () {
    var agents = Object.keys(Util.agents);

    if (agents.length) {
        var nrm = -1;
        for (var i in agents) {
            if (Util.agents[agents[i]].readyState === 1) {
                nrm = i;
                break;
            }
        }
        if (nrm == -1) {
            return false;
        }

        this.agentClient = Util.agents[agents[nrm]];

        this.realAgent = new VirtualAgent(this.client, this.agentClient, this._chatObserver.bind(this));
        this.realAgent.start(false);


        var oHistory = JSON.parse(JSON.stringify(this._SYSTEM_MESSAGE.AGENT_HISTORY_DETAILS));
        oHistory.text = this.history;
        oHistory.session = this.client.protocol;
        this.realAgent.sendSystemMessageToAgent(oHistory);

        var oAgentDetails = JSON.parse(JSON.stringify(this._SYSTEM_MESSAGE.AGENT_CONNECTED));
        oAgentDetails.text = (this.agentClient.details.user || "Support@sap") + " is online.";
        this.systemAgent.sendSystemMessageToUser(oAgentDetails);


        return true;
    } else {
        return false;
    }
};


AiEngine.prototype._SYSTEM_MESSAGE = {
    AGENT_NOT_AVAILABLE: {
        from: "bot",
        type: "message",
        tag: "close",
        text: "No customer support team available right now. Please create an incident with your problem details."
    },
    AGENT_HISTORY_DETAILS: {
        from: "bot",
        session: "",
        type: "info",
        tag: "history",
        text: ""
    },
    AGENT_CONNECTED: {
        from: "bot",
        session: "",
        type: "info",
        tag: "agent",
        text: ""
    }
};



module.exports = AiEngine;