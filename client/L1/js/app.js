(function () {
    "use strict";
    var app = angular.module("AgentAiL0", ['ngSanitize']);
    app.controller("AgentController", function ($scope, $timeout) {
        $scope.agentDetails = {
            user: "Agent@sap"
        };
        $scope.sessions = {
            // "user_1": {
            //     new: true,
            //     online: true,
            //     session: "safdsad",
            //     details: {url:"https://www.google.com"},
            //     messages: [
            //         {
            //             from:"user",
            //             text:"adadlsakd <a href='#'>link</a>"
            //         }
            //     ]
            // }
        };
        $scope.md_comment = "";
        $scope.md_comment_soultion=false;
        $scope.activeSession = null;
        $scope.sessionId = (Math.round(Math.random() * 1000000000)).toString(36);

        $scope.switchSession = function (target) {
            $scope.activeSession = target;
            target.new = false;
        };
        if (!$scope.activeSession && Object.keys($scope.sessions).length) {
            $scope.activeSession = $scope.sessions[Object.keys($scope.sessions)[0]]
        }

        $scope.addUserMessage = function (session) {
            if ($scope.session && $scope.sessions[session]) {
                var msg = {
                    type: "message",
                    from: "agent",
                    session: $scope.sessionId,
                    text: $scope.md_comment
                };

                if($scope.md_comment_soultion){
                    msg.tag="solution";
                }

                $scope.sessions[session].messages.push(msg);
                $scope.md_comment = "";
                $scope.md_comment_soultion=false;
                $scope.session.send(JSON.stringify(msg));

                $timeout(function(){
                    $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
                },1000);
            }
        };

        $scope.createSession = function () {
            if (!$scope.session)
                $scope.session = new WebSocket("ws://10.136.225.79:8000/token=" + btoa(JSON.stringify($scope.agentDetails)), ['agent_' + $scope.sessionId]);
        };

        $scope.createSession();

        $scope.retryConnect = function () {
            $timeout($scope.createSession, 1000);
        };


        $scope.session.onclose = function () {
            $scope.session = null;
            $scope.retryConnect();
        };

        $scope.session.onerror = function () {
            try {
                $scope.session.close();
            } catch (e) { }
            $scope.session = null;
            $scope.retryConnect();
        };

        $scope.session.onopen = function () {

        };

        $scope.session.onmessage = function (event) {
            var oMsg = JSON.parse(event.data);

            if (!$scope.sessions[oMsg.session]) {
                $scope.sessions[oMsg.session] = {
                    new: true,
                    online: true,
                    session: oMsg.session,
                    details: {},
                    messages: []
                };
            }

            if (oMsg.type === "message") {
                $scope.sessions[oMsg.session].messages.push(oMsg);
                $timeout(function(){
                    $("#conversation").scrollTop($("#conversation")[0].scrollHeight);
                },1000);
            } else if (oMsg.type === "info") {
                switch (oMsg.tag) {
                    case "details":
                        $scope.sessions[oMsg.session].details = oMsg.text;
                        break;
                    case "history":
                        $scope.sessions[oMsg.session].history = oMsg.text;
                        break;
                    case "close":
                        $scope.sessions[oMsg.session].online = false;
                        break;
                }
            }
            $scope.$apply();
        };
    });
})();
