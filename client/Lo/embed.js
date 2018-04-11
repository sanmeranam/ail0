$(function () {
    loadCSS("http://localhost:3000/Lo/css/styles.css");
    loadCSS("https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css");
    loadCSS("https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css");

    $.when(angular.bootstrap(document.getElementById('AIL0_Chat'), ["AIL0_Chat"])).done(function () {
        loadJS("http://localhost:3000/Lo/js/script.js");
    });
});

var loadCSS = function (href) {
    var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
    $("head").append(cssLink);
};

var loadJS = function (src) {
    var jsLink = $("<script type='text/javascript' src='" + src + "'>");
    $("head").append(jsLink);
};

var fnCollectSystemDetails = function () {
    if (sap && sap.client && sap.client.getCurrentApplication) {
        var currentApp = sap.client.getCurrentApplication();
        if (!currentApp || !currentApp.getSettings) {
            return {};
        }

        var setttings = currentApp.getSettings();

        if (!setttings) {
            return {};
        }
        var details = {
            client: setttings.getClient(),
            keyUser: setttings.isKeyUser(),
            country: setttings.getCountry(),
            systemId: setttings.getSystemId(),
            solutionVersion: setttings.getSolutionVersion(),
            user: setttings.getFormattedUserName(),
            release: setttings.getRelease(),
            uid: setttings.getIdentityGUID(),
            url: ""
        };
        var repUrl = currentApp.getRepositoryUrl();
        repUrl = repUrl.replace("http://localhost:8080/application/proxy/https/", "https://").replace("/sap/ap/ui/repository", "");
        details.url = repUrl;
        return details;
    }
    return {};
};


var chartModule = angular.module('AIL0_Chat', ['ngSanitize']);


chartModule.directive('ail0Chat', function () {
    return {
        restrict: 'E',
        template: "<div class='RecastApp' ng-show='userLoggedIn'>" +
            "	<div class='RecastAppExpander' ng-click='clientAgent.showHide(true)' style='color: rgb(255, 255, 255); background-color: #4A90E2;'>" +
            "		<img class='RecastAppExpander--logo' src='https://cdn.recast.ai/webchat/webchat-logo.svg'>" +
            "		<div class='RecastAppExpander--onboarding' ng-if='clientAgent.onboarding'>{{clientAgent.onboarding}}</div>" +
            "	</div>" +
            "	<div class='RecastAppChat' ng-show='showChat' style='background-color: rgb(255, 255, 255);'>" +
            "		<div class='RecastAppHeader' style='color: rgb(255, 255, 255); background-color: #4A90E2;'>" +
            "			<img class='RecastAppHeader--logo' src='https://cdn.recast.ai/webchat/webchat-logo.svg'>" +
            "			<div class='RecastAppHeader--title'>AIL.0 Chat</div>" +
            "			<div class='RecastAppHeader--btn'  ng-click='clientAgent.showHide(false)' >" +
            "				<img src='https://cdn.recast.ai/webchat/close.svg' >" +
            "			</div>" +
            "		</div>" +
            "		<div class='RecastAppChat--content'>" +
            "			<div class='RecastAppLive'>" +
            "				<div class='RecastAppLive--message-container'>" +
            "					<div class='RecastAppMessageContainer' ng-repeat='msg in clientAgent.messages' ng-class='msg.from'>" +
            "						<div class='RecastAppMessage' ng-class='msg.from'>" +
            "							<img ng-if=\"msg.from != 'bot'\" class='RecastAppMessage--logo visible' src='https://cdn.recast.ai/webchat/user.png'>" +
            "							<img ng-if=\"msg.from == 'bot'\" class='RecastAppMessage--logo visible' src='https://cdn.recast.ai/webchat/bot.png'>" +
            "							<div class='RecastAppQuickReplies'>" +
            "								<div class='RecastAppText' style='color: rgb(112, 112, 112); background-color: rgb(246, 246, 246); opacity: 1;' ng-bind-html='msg.text'></div>" +
            "<div ng-if='msg.quick && !msg.quick.selected' class='slick-initialized slick-slider RecastAppSlider RecastAppQuickReplies--slider'>" +
            "	<div class='RecastAppArrow prev slick-arrow slick-prev slick-disabled' style='display: block;'>" +
            "		<img src='https://cdn.recast.ai/webchat/left-arrow.svg' class='arrowSvg'>" +
            "	</div>" +
            "	<div class='slick-list'>" +
            "		<div class='slick-track' style='opacity: 1; transform: translate3d(-5px, 0px, 0px); width: 1740px;'>" +
            "			<div ng-repeat='btn in msg.quick.options' ng-click='selectOption(btn,msg)' class='slick-slide slick-active RecastAppQuickReplies--button' data-index='0' tabindex='-1' style='outline: none; border: 1px solid rgb(224, 90, 71); color: rgb(224, 90, 71);'>{{btn.title}}</div>" +
            "		</div>" +
            "	</div>" +
            "	<div class='RecastAppArrow next slick-arrow slick-next' style='display: block;'>" +
            "		<img src='https://cdn.recast.ai/webchat/right-arrow.svg' class='arrowSvg'>" +
            "	</div>" +
            "</div>" +
            "							</div>" +
            "						</div>" +
            "					</div>" +
            "				</div>" +
            "			</div>" +
            "			<div class='RecastAppChat--slogan'>{{connectionActive?message:'Connection lost..!'}}</div>" +
            "		</div>" +
            "		<div class='RecastAppInput'>" +
            "			<form>" +
            "				<input type='text' ng-disabled='!connectionActive' ng-model='typeText' ng-keyup='$event.keyCode == 13 && addUserMessage()' placeholder='Write a reply...' style='width: 100%;'>" +
            "			</form>" +
            "		</div>" +
            "	</div>" +
            "</div>",
        link: function (scope, element) {
        },
        controller: function ($scope, $window, $interval,$sce) {
            $scope.typeText = "";
            $scope.showChat = false;
            $scope.userLoggedIn = false;//$window.sap.client.getCurrentApplication().isLoggedIn();
            $scope.session = "";
            $scope.message = "";
            $scope.connectionActive = false;
            $scope.systemDetails = {};
            $scope.sessionId = 'user_' + (Math.round(Math.random() * 1000000000)).toString(36);

            var stopTime = $interval(function () {
                var setttings = fnCollectSystemDetails();
                if (setttings.user) {
                    if (setttings.keyUser) {
                        $scope.sessionId = 'user_' + setttings.uid;
                        $scope.systemDetails = setttings;
                        $scope.userLoggedIn = true;
                    }

                    $interval.cancel(stopTime);
                }
            }, 5000);

            $scope._createSession = function () {
                return new WebSocket("ws://localhost:8000/token=" + btoa(JSON.stringify($scope.systemDetails)), [$scope.sessionId]);
            };

            $scope.clientAgent = {
                onboarding: "",
                showHide: function (b) {
                    $scope.showChat = b;
                    if (b && !$scope.session) {
                        $scope.session = $scope._createSession();

                        $scope.session.onerror = function (event) {
                            try {
                                $scope.session.close();
                                $scope.session = null;
                                $scope.connectionActive = false;
                            } catch (e) { }
                        }
                        $scope.session.onclose = function (event) {
                            $scope.connectionActive = false;
                            $scope.session = null;
                        }

                        $scope.session.onopen = function (event) {
                            $scope.connectionActive = true;
                        }

                        $scope.session.onmessage = function (event) {
                            var msg = JSON.parse(event.data);
                            if (msg.type === "message") {
                                msg.text=$sce.trustAsHtml(msg.text);
                                $scope.clientAgent.messages.push(msg);
                            } else if (msg.type === "info") {
                                switch (msg.tag) {
                                    case "agent":
                                        $scope.message = msg.text;
                                        break;
                                    case 'close':
                                        $scope.message = msg.text;
                                        $scope.session.close();
                                        $scope.session = null;
                                        $scope.connectionActive = false;
                                        break;
                                }
                            }
                            $scope.$apply();
                            $(".RecastAppLive").scrollTop($(".RecastAppLive")[0].scrollHeight);
                        };
                    } else if ($scope.session) {
                        try {
                            $scope.session.close();
                            $scope.connectionActive = false;
                            $scope.message="";
                        } catch (e) { }
                    }
                },
                messages: []
            };

            $scope.addUserMessage = function () {
                var msg = {
                    session: $scope.sessionId,
                    from: "user",
                    type: "message",
                    text: $scope.typeText
                };
                $scope.clientAgent.messages.push(msg);
                $scope.typeText = '';
                if ($scope.session) {
                    $scope.session.send(JSON.stringify(msg));
                }
                $(".RecastAppLive").scrollTop($(".RecastAppLive")[0].scrollHeight)
            };

            $scope.selectOption = function (option, msg) {
                msg.quick.selected = option;
                var msg = {
                    session: $scope.sessionId,
                    from: "user",
                    type: "message",
                    tag: "option",
                    text: option.value
                };
                if ($scope.session) {
                    $scope.session.send(JSON.stringify(msg));
                }
            };
        }
    };
});
