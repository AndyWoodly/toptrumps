angular.module('toptrumps', [])

.controller('MainCtl', ['$scope', function($scope) {

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


}]);