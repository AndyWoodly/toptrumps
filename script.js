angular.module('toptrumps', [])

.factory('utils', function() {
    return {
        shuffle: function(arry) {
                var i, temp, j, len = arry.length;
                for (i = 0; i < len; i++) {
                    j = ~~(Math.random() * (i + 1));
                    temp = arry[i];
                    arry[i] = arry[j];
                    arry[j] = temp;
                }
                return arry;
            }
    }
})

.controller('MainCtl', ['$scope', '$http', '$log', 'utils', function($scope, $http, log, Utils) {

    $scope.button = {
        text: "Battle!"
    };

    $scope.playerA = {
        name: "drop here",
        valid: false,
        wins: 0,
        losses: 0
    };

    $scope.playerB = {
        name: "drop here",
        valid: false,
        wins: 0,
        losses: 0
    };

    $scope.nrOfGames = 100;

    $scope.isRunning = false;

    $scope.canPlay = function() {
        return $scope.playerA.valid
                && $scope.playerB.valid
                && !$scope.isRunning;
    };

    function resetPlayerStats() {
        $scope.playerA.wins = 0;
        $scope.playerA.losses = 0;
        $scope.playerB.wins = 0;
        $scope.playerB.losses = 0;
    }

    function dealCards(cards) {
        var result = [[],[]];
        for (var i = 0; i < cards.length; i++) {
            result[i%2].push(cards[i]);
        }
        return result;
    }

    function toString(card, index) {
        return card.name + " " + card.values[index];
    }

    function playGame() {
        // play a single game
        Utils.shuffle($scope.data.cards);

        var game = dealCards($scope.data.cards);
        var players = [$scope.playerA, $scope.playerB];

        var currPlayerIdx = 0;
        var turns = 0;
        var winner, looser;
        while (game[0].length > 0 && game[1].length > 0) {
            var otherPlayerIdx = (currPlayerIdx+1)%2;
            var currPlayerCard = game[currPlayerIdx][0];
            var otherPlayerCard = game[otherPlayerIdx][0];
            var question = players[currPlayerIdx].ask(currPlayerCard);
            winner = currPlayerIdx;
            looser = otherPlayerIdx;
            if (otherPlayerCard.values[question.idx] > question.value) {
                // current player lost
                winner = otherPlayerIdx;
                looser = currPlayerIdx;
            }
            var winningCard = game[winner].shift();
            var loosingCard = game[looser].shift();
            players[winner].cardWon(winningCard, loosingCard);
            players[looser].cardLost(loosingCard, winningCard);
            game[winner].push(loosingCard);
            game[winner].push(winningCard); // TODO define order

            if ($scope.logTurns) {
                var winnnerText = (winner == 0 ? "A" : "B") + " " + $scope.data.legend[question.idx] + ": ";
                var wonFmt = toString(winningCard, question.idx);
                var lostFmt = toString(loosingCard, question.idx);
                log.log(winnnerText + wonFmt+" > "+ lostFmt);
            }

            currPlayerIdx = winner;
            turns++;
        }

        players[winner].wins++;
        players[looser].losses++;

        if ($scope.logTurns) {
            log.log("### Victory "+players[winner].wins+": player "+(winner == 0 ? "A" : "B")+" ("+players[winner].name+") - "+turns+ " turns");
        }
    }

    $scope.play = function() {
        $scope.isRunning = true;

        resetPlayerStats();

        for (var i = 0; i < $scope.nrOfGames; i++) {
            playGame();
        }

        $scope.isRunning = false;
    };

    function init() {
        $http.get("data/data.json")
            .success(function(data) {
                $scope.data = data;
                if (angular.isDefined(data)) {
                    log.log("got card data");
                }
            })
            .error(function(data, status) {
                alert("Failed to load card data, "+status);
            });
    }

    init();

    $scope.$on("playerdrop", function(event, data) {
        var r = new FileReader();
        r.onload = function(e) {
            var source = e.target.result;
            try {
                var player = eval(source);
                player.wins = 0;
                player.losses = 0;
                // TODO verify player
                player.valid = true;
                for (var attr in player) {
                    if (player.hasOwnProperty(attr)) {
                        data.player[attr] = player[attr];
                    }
                }
                $scope.$digest();
            } catch (e) {
                alert("Failed to parse player source.");
                log.log(e);
            }
        };
        r.onerror = function(error) {
            alert("Failed to load dropped file.");
            log.log(error);
        };
        r.readAsText(data.file);
    });

}])

.directive('playerDropZone', function() {
    return {
        restrict: 'E',
        templateUrl: 'dropzone.tpl.html',
        transclude: true,
        scope: {
            player: '='
        },
        link: function(scope, el, attrs, controller) {
            el.bind("dragover", function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.dataTransfer.dropEffect = 'move';
                return false;
            });

            el.bind("dragenter", function(e) {
                angular.element(e.target).addClass('drag-over');
            });

            el.bind("dragleave", function(e) {
                angular.element(e.target).removeClass('drag-over');
            });

            el.bind("drop", function(e) {
                angular.element(e.target).removeClass('drag-over');
                if (e.preventDefault) {
                    e.preventDefault();
                }

                if (e.stopPropogation) {
                    e.stopPropogation();
                }

                var dt = e.dataTransfer;
                var files = dt.files;

                scope.$emit("playerdrop", {
                    player: scope.player,
                    file: files[0]
                });
                return false;
            });

        }
    }
});