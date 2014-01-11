toptrumps
=========

[Top Trumps](http://en.wikipedia.org/wiki/Top_Trumps) is the well known card game we used to play in our childhood. This project is a playground for development of the perfect top trumps computer player. 

deployed version
----------------
http://andywoodly.github.io/toptrumps

computer player
---------------

computer players must stick to the following implementation detail (see simplePlayer.js as a sample implementation):

```javascript
(function() {
    var player = {
        name: "A descriptive player name ",

        init: function(completeCardData) {
            // perform card analysis here
        },

        ask: function(myCard) {
            // give your card, make a category selection here, return selected index and value
            return {
                idx: theCategoryIndex,
                value: theCardValue
            };
        },

        cardWon: function(myCard, otherCard) {
            // callback if you won a card
        },

        cardLost: function(myCard, otherCard) {
            // callback if you lost a card
        }
    };
    return player;
})();
```

test setup
----------

Install karma

 sudo npm install -g karma

Start karma

 karma start
