(function() {
    var player = {
        name: "Random Player",

        init: function(completeCardData) {
            // do nothing
        },

        ask: function(myCard) {
            // ask random category
            if (!myCard || !myCard.values) {
                throw new Error("Ill formatted card", myCard);
            }
            var nrOfValues = myCard.values.length;
            var idx = Math.floor(Math.random() * nrOfValues);
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