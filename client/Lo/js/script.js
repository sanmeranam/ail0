function fnRecastChat(container, options) {
    options = typeof options !== "undefined" ? options : {};

    this.colorScheme = options.colorScheme || "#4A90E2";

    $(".RecastAppHeader").css('background-color', this.colorScheme);

    var hideRecastChat = function() {
        $(".RecastAppChat").hide();
    };

    var showRecastChat = function() {
        $(".RecastAppChat").show();
    };

    var bindEvents = function() {
        $(".RecastAppHeader--btn").off("click", hideRecastChat);
        $(".RecastAppHeader--btn").on("click", hideRecastChat);

        $(".RecastAppExpander").off("click", showRecastChat);
        $(".RecastAppExpander").on("click", showRecastChat);
    };

    var bindRepliesEvent = function(type, replies, ctx) {
        var fn = function() {
            var index = $(this).attr('data-index');
            var reply = replies[index];

            $(".RecastAppSlider").remove();

            ctx.addUserMsg({
                text: reply.text
            });
        };
        $(".RecastAppQuickReplies--" + type).off("click", fn);
        $(".RecastAppQuickReplies--" + type).on("click", fn);
    };

    hideRecastChat();
    bindEvents();

    if (!container) {
        container = ".RecastAppLive--message-container";
    }

    this.container = $(container);

    $("#input-msg").off("keypress");
    $("#input-msg").on("keypress", function(event) {
        event.stopPropagation();
        if (event.which === 13) {

        }
    }.bind(this));

    this.addBotMsg = function(message) {
        var text = message ? message.text : "";
        var message_template = '<div class="RecastAppMessageContainer bot">' +
            '<div class="RecastAppMessage bot">' +
            '<img class="RecastAppMessage--logo visible" src="https://cdn.recast.ai/webchat/bot.png">' +
            '<div class="RecastAppQuickReplies">' +
            '<div class="RecastAppText" style="color: rgb(112, 112, 112); background-color: rgb(246, 246, 246); opacity: 1;">' + text + '</div>';

        var quickReplies_template = "";
        var isReplies = false;
        if (message.quickReplies && message.quickReplies.replies && message.quickReplies.replies.length) {
            isReplies = true;
            quickReplies_template = getQuickRepliesSlider(message.quickReplies, this);
        }

        message_template = message_template + quickReplies_template + '</div></div></div>';

        this.container.append(message_template);

        if(isReplies) {
            bindRepliesEvent(message.quickReplies.type, message.quickReplies.replies, this);
        }
    };

    this.addUserMsg = function(message) {
        var text = message ? message.text : "";
        var message_template = '<div class="RecastAppMessageContainer user">' +
            '<div class="RecastAppMessage user">' +
            '<img class="RecastAppMessage--logo visible" src="https://cdn.recast.ai/webchat/user.png">' +
            '<div class="RecastAppText" style="color: rgb(255, 255, 255); background-color: ' + this.colorScheme + '; opacity: 1;">' + text + '</div>' +
            '</div></div>';
        this.container.append(message_template);
    };

    var getQuickRepliesSlider = function(quickReplies, ctx) {
        var replies_template = '<div class="slick-initialized slick-slider RecastAppSlider RecastAppQuickReplies--slider">' +
            '<div class="RecastAppArrow prev slick-arrow slick-prev" style="display: block;">' +
            '<img src="https://cdn.recast.ai/webchat/left-arrow.svg" class="arrowSvg">' +
            '</div>' +
            '<div class="slick-list">' +
            '<div class="slick-track" style="opacity: 1; transform: translate3d(-5px, 0px, 0px); width: 2610px;">';

        replies_template += quickReplies.replies.map(function(reply, index) {
            return getReplyTemplate(reply, index, quickReplies.type, ctx);
        }.bind(ctx)).join(" ");

        replies_template += '</div></div>' +
            '<div class="RecastAppArrow next slick-arrow slick-next" style="display: block;">' +
            '<img src="https://cdn.recast.ai/webchat/right-arrow.svg" class="arrowSvg">' +
            '</div></div>';

        return replies_template;
    };

    var getReplyTemplate = function(reply, index, type, ctx) {
        var reply_template = '<div data-index=' + index + ' class="slick-slide slick-active RecastAppQuickReplies--button"' +
            'tabindex="-1" style="outline: none; border: 1px solid ' + ctx.colorScheme + ';' +
            'color: ' + ctx.colorScheme + ';">' + reply.text + '</div>';
        return reply_template;
    };

    var getCurrentTimestamp = function() {
        var date = new Date();
        return date.toLocaleString();
    };
}

if (typeof exports !== "undefined") {
    exports.recastChat = fnRecastChat;
}