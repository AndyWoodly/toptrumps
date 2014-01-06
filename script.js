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

.controller('MainCtl', ['$scope', '$http', 'utils', function($scope, $http, Utils) {

    $scope.button = {
        text: "Play"
    };

    $scope.playerA = {
        name: "Player A",
        wins: 0,
        losses: 0
    };

    $scope.playerB = {
        name: "Player B",
        wins: 0,
        losses: 0
    };

    var dealCards = function(cards) {
        var result = [[],[]];
        for (var i = 0; i < cards.length; i++) {
            result[i%2].push(cards[i]);
        }
        return result;
    };

    $scope.play = function() {
        $scope.canPlay = false;
        // play a single game
        Utils.shuffle($scope.data.cards);

        var game = dealCards($scope.data.cards);
        var players = [$scope.playerA, $scope.playerB];

        var currPlayerIdx = 0;
        var turns = 0;
        while (game[0].length > 0 && game[1].length > 0) {
            var otherPlayerIdx = (currPlayerIdx+1)%2;
            var currPlayerCard = game[currPlayerIdx][0];
            var otherPlayerCard = game[otherPlayerIdx][0];
            var question = players[currPlayerIdx].ask(currPlayerCard);
            var winner = currPlayerIdx;
            var looser = otherPlayerIdx;
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

            currPlayerIdx = winner;
            turns++;
        }

        alert("player "+currPlayerIdx+ " won!");
        $scope.canPlay = true;
    };

    $scope.canPlay = false;

    function init() {
        $http.get("data/data.json")
            .success(function(data) {
                $scope.data = data;
                if (angular.isDefined(data)) {
                    console.log("got card data");
                    $scope.canPlay = true;
                }
            })
            .error(function(data, status) {
                alert("Failed to load card data, "+status);
            });
    }

    init();

    $scope.$on("filedrop", function(event, data) {
        console.log("loading player", data.id);
        var r = new FileReader();
        r.onload = function(e) {
            var source = e.target.result;
            try {
                var player = eval(source);
                player.wins = 0;
                player.losses = 0;
                $scope[data.id] = player;
                $scope.$apply();
            } catch (e) {
                alert("Failed to parse player source.");
                console.log(e);
            }
        };
        r.onerror = function(error) {
            alert("Failed to load dropped file.");
            console.log(error);
        };
        r.readAsText(data.file);
    });

}])

.directive('dropZone', function() {
    return {
        restrict: 'E',
        templateUrl: 'dropzone.tpl.html',
        scope: {
            id: '='
        },
        link: function(scope, el, attrs, controller) {
            var id = scope.id;

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
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                if (e.stopPropogation) {
                    e.stopPropogation(); // Necessary. Allows us to drop.
                }

                var dt = e.dataTransfer;
                var files = dt.files;

                scope.$emit("filedrop", { id: id, file: files[0] });
                return false;
            });

        }
    }
});