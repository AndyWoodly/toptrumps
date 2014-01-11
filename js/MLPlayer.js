(function() {
    var player = {
        name: "Maximum Likelihood Player",

        init: function(data) {
            // build value ranks
            var values = {};
            data.cards.forEach(function(card) {
                for (var i = 0; i < card.values.length; i++) {
                    if (!values[i]) {
                        values[i] = [];
                    }
                    values[i].push(card.values[i]);
                }
            });
            for (v in values) {
                values[v].sort();
            }
            console.log(values);
            // create value to rank index
            this.ranks = {};
            for (i in values) {
                if (!this.ranks[i]) {
                    this.ranks[i] = {};
                }
                var catVals = values[i];
                for (var rank = 0; rank < catVals.length; rank++) {
                    var val = catVals[rank];
                    this.ranks[i][val] = rank;
                }
            }
            console.log(this.ranks);
        },

        ask: function(myCard) {
            // ask random category
            if (!myCard || !myCard.values) {
                throw new Error("Ill formatted card", myCard);
            }
            var nrOfValues = myCard.values.length;
            var idx = 0;
            var maxRank = 0;
            for (var i = 0; i < nrOfValues; i++) {
                var cardValue = myCard.values[i];
                var cardRank = this.ranks[i][cardValue];
                if (cardRank > maxRank) {
                    idx = i;
                    maxRank = cardRank;
                }
            }
            return {
                idx: idx,
                value: myCard.values[idx]
            };
        },

        cardWon: function(myCard, otherCard) {
            // do nothing
        },

        cardLost: function(myCard, otherCard) {
            // do nothing
        }
    };
    return player;
})();