const BaseDeck = require('../database/BaseDeck')
const GameDeck = require('../database/GameDeck')
const GameUser = require('../database/GameUser')
const GameDeckCard = require('../database/GameDeck')


const GameDeckController = {

    // These functions should only be called within the Game controller after Game instance
    // has reached max number of players
    createGameDeck: (game) => {

        // Need to get all game users of game from database
        GameUser.getGameUsers()
            .then((gameUsers) => {

                if (gameUsers.length < 4) {
                    // TODO: Throw error
                }


                // Need to get Base Deck from database
                BaseDeck.getDeck()
                    .then((baseDeck) => {

                        // Iterate over baseDeck array and create Game Deck Card objects
                        gameDeck = [];

                        baseDeck.forEach((card, i) => {
                            let gameCard = new GameDeckCard(game, 0, card.id, 0);

                            gameDeck.push(gameCard);
                        });

                        // Shuffle gameDeck
                        GameDeckController.shuffle(gameDeck);

                        // Deal 7 cards to each Game User
                        GameDeckController.dealCards(gameUsers, gameDeck);


                        // Insert all Game Deck Card objects into database using Promise.all
                        var promises = [];

                        gameDeck.forEach((gameCard) => {
                            promises.push(
                                gameCard.save()
                            );
                        });

                        Promise.all(promises)
                            .catch((err) => {
                                console.log(err);
                            })
                    });

            })
            .catch((err) => {
                console.log(err);


            });

    },

    shuffle: (gameDeck, numShuffles) => {

        if (!(gameDeck instanceof Array)) {
            throw new Error("gameDeck must be an array.");
        }

        if (!(gameDeck[0] instanceof GameDeckCard)) {
            throw new Error("gameDeck objects must be a GameDeckCard object.");
        }

        const numCards = gameDeck.length;

        for (let shuffles = 0; shuffles < numShuffles; shuffles++) {

            // Shuffle gameDeck cards in array
            for (let i = 0; i < numCards; i++) {

                const randomIndex = Math.floor(Math.random() * numCards);

                const tmp = gameDeck[randomIndex];

                gameDeck[randomIndex] = gameDeck[i];
                gameDeck[i] = tmp;
            }

        }

        // Iterate over array again and update order values of GameDeckCard object
        gameDeck.forEach((gameCard, i) => {
            gameCard.order = i;
        });

        return gameDeck;
    },

    // Deal 7 cards to each game user
    // gameUsers: Array of GameUser objects
    // gameDeck: Array of GameDeckCard objects
    dealCards: (gameUsers, gameDeck) => {
        if (!(gameUsers instanceof Array)) {
            throw new Error("gameUsers must be an array")
        }

        if (!(gameUsers[0] instanceof GameUser)) {
            throw new Error("gameUsers objects must be a GameUser object.");
        }

        if (!(gameDeck instanceof Array)) {
            throw new Error("gameDeck must be an array.");
        }

        if (!(gameDeck[0] instanceof GameDeckCard)) {
            throw new Error("gameDeck objects must be a GameDeckCard object.");
        }

        topCard = 0;
        for (let i = 0; i < 7; i++) {

            for (let gameUser of gameUsers) {

                gameDeck[topCard].user = gameUser.user;
                gameDeck[topCard].order = GameDeckCard.DRAWN;
                topCard++;
            }
        }
    }
}

module.exports = GameDeckController;