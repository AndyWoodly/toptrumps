describe("toptrumps: ", function() {

    var gameService, data, Player;

    beforeEach(module('toptrumps'));

    beforeEach(function() {

        inject(function($injector) {
            gameService = $injector.get('GameService');
        });

        data = {
            cards: [
                {
                    "name": "Winner",
                    "values": [ 11, 22 ]
                },
                {
                    "name": "Looser",
                    "values": [ 1, 2 ]
                }
            ]
        };

        Player = function () {
            this.wins = 0;
            this.losses = 0;
            this.init = jasmine.createSpy();
            this.ask = function(myCard) {
                return {
                    idx: 0,
                    value: myCard.values[0]
                };
            };
            this.cardWon = jasmine.createSpy();
            this.cardLost = jasmine.createSpy();
        };

    });

    describe("GameService -", function() {

        it("should interact with players correctly", function() {

            var playerA = new Player();
            var playerB = new Player();
            var game = gameService.createGame(data, playerA, playerB);
            game.setIterations(1);
            game.play();

            expect(playerA.init).toHaveBeenCalledWith(data);
            expect(playerB.init).toHaveBeenCalledWith(data);

            expect(playerA.cardWon).toHaveBeenCalledWith(data.cards[0],data.cards[1]);
            expect(playerA.cardLost).not.toHaveBeenCalled();
            expect(playerB.cardLost).toHaveBeenCalledWith(data.cards[1],data.cards[0]);
            expect(playerB.cardWon).not.toHaveBeenCalled();

            expect(playerA.wins).toBe(1);
            expect(playerA.losses).toBe(0);

            expect(playerB.wins).toBe(0);
            expect(playerB.losses).toBe(1);
        });

    });

});