angular.module('toptrumps', [])

.controller('MainCtl', ['$scope', '$http', function($scope, $http) {

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

    $scope.play = function() {
        alert("play");
    };

    $scope.canPlay = true;

    function init() {
        $http.get("data/data.json")
            .success(function(data) {
                $scope.data = data;
                if (angular.isDefined(data)) {
                    console.log("got card data");
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