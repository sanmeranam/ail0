var recastai = require('recastai');


module.exports = reactCover = function () {
    this.session = new recastai.build('9abe46c29c30fe49e9ba2506b0a4257a', 'en');
    this.protocol = "system_" + Math.round(Math.random() * 10000000);
    this.details = {
        user: this.protocol
    };
};

reactCover.prototype.close = function () {

};

reactCover.prototype.on = function (type, callback) {
    switch (type) {
        case 'message':
            this.callbackMessage = callback;
            break;
        case 'open':
            this.callbackOpen = callback;
            break;
    }
};

reactCover.prototype.replaceURLWithHTMLLinks = function (text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1'>$1</a>");
};

reactCover.prototype.replaceYoutubeIframe = function (text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, '<iframe width="250" height="180" src="$1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen=""></iframe>');
};


reactCover.prototype._processMessage = function (messages) {
    var message = {
        from: "bot",
        type: "message",
        text: ""
    };
    var oMsg, title;

    for (var i in messages) {
        oMsg = messages[i];
        title = oMsg.content;

        if (typeof (title) === "string") {
            message.text += ' ' + title;
        } else {
            message.text += ' ' + oMsg.content.title;
            message.quick = {
                selected: '',
                type: "button",
                options: oMsg.content.buttons
            }
        }
    }
    if (message.text.indexOf("youtube.com") > -1) {
        message.text = this.replaceYoutubeIframe(message.text);
    } else {
        message.text = this.replaceURLWithHTMLLinks(message.text);
    }

    return message;
};


reactCover.prototype.send = function (oMessage) {
    oMessage = JSON.parse(oMessage);

    this.session.dialog({ type: 'text', content: oMessage.text.toLowerCase() }, { conversationId: this.protocol })
        .then(function (res) {
            if (res.messages && res.messages.length) {

                var message = this._processMessage(res.messages);

                if (this.callbackMessage) {
                    this.callbackMessage(JSON.stringify(message));
                }

            }



        }.bind(this))
        .catch(function (err) {
            console.log(err);
        });
};