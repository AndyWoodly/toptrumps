angular.module('toptrumps', [])

.factory('utils', function() {
    return {
        shuffle: function(array) {
            var i, temp, j, len = array.length;
            for (i = 0; i < len; i++) {
                j = ~~(Math.random() * (i + 1));
                temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }
    }
})

.factory('GameService', function() {
    function dealCards(cards) {
        var result = [[],[]];
        for (var i = 0; i < cards.length; i++) {
            result[i%2].push(cards[i]);
        }
        return result;
    }

    function Game(cardData, playerA, playerB, gameTracker) {
        this.cardData = cardData;
        this.players = [playerA, playerB];
        this.gameTracker = gameTracker;
        this.nrOfIterations = 100;

        this.setIterations = function(nrOfIterations) {
            this.nrOfIterations = nrOfIterations;
        };

        this.play = function() {
            this.players[0].init(this.cardData);
            this.players[1].init(this.cardData);
            var game = dealCards(this.cardData.cards);

            var currPlayerIdx = 0;
            var nrOfTurns = 0;
            var winnerIdx, looserIdx;
            while (game[0].length > 0 && game[1].length > 0) {
                var otherPlayerIdx = (currPlayerIdx+1)%2;
                var currPlayerCard = game[currPlayerIdx][0];
                var otherPlayerCard = game[otherPlayerIdx][0];
                var question = this.players[currPlayerIdx].ask(currPlayerCard);
                winnerIdx = currPlayerIdx;
                looserIdx = otherPlayerIdx;
                if (otherPlayerCard.values[question.idx] > question.value) {
                    // current player lost
                    winnerIdx = otherPlayerIdx;
                    looserIdx = currPlayerIdx;
                }
                var winningCard = game[winnerIdx].shift();
                var loosingCard = game[looserIdx].shift();
                this.players[winnerIdx].cardWon(winningCard, loosingCard);
                this.players[looserIdx].cardLost(loosingCard, winningCard);

                // TODO define order how won cards are queued
                game[winnerIdx].push(loosingCard);
                game[winnerIdx].push(winningCard);

                if (gameTracker) {
                    gameTracker.onTurn(winnerIdx, winningCard, loosingCard, question.idx, this.cardData.legend[question.idx]);
                }

                currPlayerIdx = winnerIdx;
                nrOfTurns++;
            }

            this.players[winnerIdx].wins++;
            this.players[looserIdx].losses++;

            if (gameTracker) {
                gameTracker.onWin(winnerIdx, this.players[winnerIdx], nrOfTurns);
            }
        }
    }

    return {

        createGameTracker: function(log, logTurns, logWins) {
            function toString(card, index) {
                return card.name + " " + card.values[index];
            }

            return {
                onTurn: function(winnerIdx, winningCard, loosingCard, questionIdx, categoryText) {
                    if (logTurns) {
                        var winnnerText = (winnerIdx == 0 ? "A" : "B") + " " + categoryText + ": ";
                        var wonFmt = toString(winningCard, questionIdx);
                        var lostFmt = toString(loosingCard, questionIdx);
                        log.log(winnnerText + wonFmt+" > "+ lostFmt);
                    }
                },
                onWin: function(winnerIdx, winner, turns) {
                    if (logWins) {
                        log.log("### Victory "+winner.wins+": player "+(winnerIdx == 0 ? "A" : "B")+" ("+winner.name+") - "+turns+ " turns");
                    }
                }
            };
        },

        createGame: function(cardData, playerA, playerB, gameTracker) {
            return new Game(cardData, playerA, playerB, gameTracker);
        }

    }
})

.controller('MainCtl', ['$scope', '$http', '$log', 'utils', 'GameService',
            function($scope, $http, log, Utils, GameService) {

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


    $scope.play = function() {
        $scope.isRunning = true;

        resetPlayerStats();

        var gameTracker = GameService.createGameTracker(log, $scope.logTurns, $scope.logWins);

        for (var i = 0; i < $scope.nrOfGames; i++) {
            Utils.shuffle($scope.data.cards);
            var game = GameService.createGame($scope.data, $scope.playerA, $scope.playerB, gameTracker);
            game.setIterations($scope.nrOfGames);
            game.play();
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