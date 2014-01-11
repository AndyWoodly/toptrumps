describe("toptrumps: ", function() {

    var gameService;

    beforeEach(module('toptrumps'));

    beforeEach(function() {
        inject(function($injector) {
            gameService = $injector.get('GameService');
        });
    });

    describe("GameService -", function() {

        it("should work correctly", function() {
            var data = {
                cards: [
                    {
                        "name": "Winner",
                        "values": [ 11, 22, 33, 44, 55 ]
                    },
                    {
                        "name": "Looser",
                        "values": [ 1, 2, 3, 4, 5 ]
                    }
                ]
            };
            var Player = function () {
                this.wins = 0;
                this.losses = 0;
                this.init = function(data) {
                    this.data = data;
                };

                this.ask = function(myCard) {
                    return {
                        idx: 0,
                        value: myCard.values[0]
                    };
                };

                this.cardWon = function(myCard, otherCard) {
                    this.cardWon = otherCard;
                };

                this.cardLost = function(myCard, otherCard) {
                    this.cardLost = myCard;
                }
            };

            var playerA = new Player();
            var playerB = new Player();
            var game = gameService.createGame(data, playerA, playerB);
            game.setIterations(1);
            game.play();

            expect(playerA.data).toBe(data);
            expect(playerB.data).toBe(data);

            expect(playerA.wins).toBe(1);
            expect(playerA.losses).toBe(0);
            expect(playerB.wins).toBe(0);
            expect(playerB.losses).toBe(1);
        });

    });

});